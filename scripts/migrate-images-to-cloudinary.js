const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { v2: cloudinary } = require("cloudinary");

const Product = require("../route/productschema");

dotenv.config();

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitArg = args.find((arg) => arg.startsWith("--limit="));
const uploadsArg = args.find((arg) => arg.startsWith("--uploads="));

const limit = limitArg ? Number(limitArg.split("=")[1]) : null;
const uploadsRoot = uploadsArg
  ? path.resolve(uploadsArg.split("=")[1])
  : path.resolve(__dirname, "..", "uploads");

function validateEnv() {
  const required = [
    "MONGODB_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

function resolveLocalPath(imageValue) {
  if (!imageValue) return null;

  const normalized = String(imageValue).replace(/\\/g, "/").replace(/^\/+/, "");

  if (/^https?:\/\//i.test(normalized)) {
    return null;
  }

  if (normalized.startsWith("uploads/")) {
    return path.resolve(__dirname, "..", normalized);
  }

  return path.resolve(uploadsRoot, path.basename(normalized));
}

async function run() {
  validateEnv();

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  await mongoose.connect(process.env.MONGODB_URL);

  const report = {
    totalProducts: 0,
    alreadyRemote: 0,
    candidates: 0,
    missingFile: 0,
    uploaded: 0,
    failed: 0,
  };

  try {
    const query = {};
    const products = await Product.find(query).select("_id name image").lean();
    report.totalProducts = products.length;

    const scopedProducts = Number.isFinite(limit)
      ? products.slice(0, Math.max(0, limit))
      : products;

    for (const product of scopedProducts) {
      const imageValue = product.image;

      if (!imageValue) {
        report.failed += 1;
        console.log(`[FAIL] ${product._id} has empty image field`);
        continue;
      }

      if (/^https?:\/\//i.test(String(imageValue))) {
        report.alreadyRemote += 1;
        continue;
      }

      report.candidates += 1;
      const localPath = resolveLocalPath(imageValue);

      if (!localPath || !fs.existsSync(localPath)) {
        report.missingFile += 1;
        console.log(`[MISSING] ${product._id} ${product.name || "Unnamed"} -> ${localPath || imageValue}`);
        continue;
      }

      if (dryRun) {
        console.log(`[DRY-RUN] ${product._id} ${product.name || "Unnamed"} -> ${localPath}`);
        continue;
      }

      try {
        const uploadResult = await cloudinary.uploader.upload(localPath, {
          folder: process.env.CLOUDINARY_FOLDER || "ecommerse/products",
          resource_type: "image",
        });

        await Product.updateOne(
          { _id: product._id },
          { $set: { image: uploadResult.secure_url } }
        );

        report.uploaded += 1;
        console.log(`[UPLOADED] ${product._id} ${product.name || "Unnamed"}`);
      } catch (error) {
        report.failed += 1;
        console.log(`[FAIL] ${product._id} ${product.name || "Unnamed"} -> ${error.message}`);
      }
    }

    console.log("\nMigration summary:");
    console.log(`totalProducts: ${report.totalProducts}`);
    console.log(`alreadyRemote: ${report.alreadyRemote}`);
    console.log(`candidates: ${report.candidates}`);
    console.log(`missingFile: ${report.missingFile}`);
    console.log(`uploaded: ${report.uploaded}`);
    console.log(`failed: ${report.failed}`);
    console.log(`mode: ${dryRun ? "dry-run" : "real"}`);
  } finally {
    await mongoose.disconnect();
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error.message);
    process.exit(1);
  });
