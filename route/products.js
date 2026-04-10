
const express = require("express");
const router = express.Router();
const multer = require("multer");
const streamifier = require("streamifier");
const { v2: cloudinary } = require("cloudinary");
const Product = require("./productschema");

// -------------------- MULTER SETUP --------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("image");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const cloudinaryStream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || "ecommerse/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(cloudinaryStream);
  });
}

// -------------------- ADD NEW PRODUCT --------------------
router.post("/products", (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ message: "File upload failed" });
    if (!req.file)
      return res.status(400).json({ message: "No image uploaded" });

    try {
      const { name, size, price, description, category, season, gender } =
        req.body;
      const uploadResult = await uploadToCloudinary(req.file);
      const imagePath = uploadResult.secure_url;

      const newProduct = new Product({
        image: imagePath,
        name,
        size,
        price,
        description,
        category,
        season,
        gender,
      });

      await newProduct.save();
      res.status(200).json({ message: "Item added successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error saving product" });
    }
  });
});

// -------------------- GET PRODUCTS (FILTER + SEARCH) --------------------
router.get("/products", async (req, res) => {
  try {
    const { gender, category, search } = req.query;
    const filter = {};

    // ✅ Gender & Category filters (case-insensitive)
    if (gender) filter.gender = new RegExp(`^${gender}$`, "i");
    if (category) filter.category = new RegExp(`^${category}$`, "i");

    // ✅ Search filter (matches name or description)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    console.log("🧩 Applied Filter:", filter);

    const products = await Product.find(filter);

    if (!products || products.length === 0) {
      console.log("⚠️ No products found for filter:", filter);
    } else {
      console.log(`✅ Found ${products.length} products`);
    }

    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});
// -------------------- GET SINGLE PRODUCT BY ID --------------------
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("❌ Error fetching product by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
