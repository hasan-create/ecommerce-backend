const mongoose = require("mongoose");

const atlasUri = process.env.MONGODB_URL;

if (!atlasUri) {
  console.error("Missing MONGODB_URL");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(atlasUri);
    const db = mongoose.connection.db;

    const total = await db.collection("products").countDocuments({});
    const remote = await db
      .collection("products")
      .countDocuments({ image: /^https?:\/\//i });
    const localStyle = await db
      .collection("products")
      .countDocuments({ image: { $regex: "^uploads[\\/]" } });
    const missingRequired = await db.collection("products").countDocuments({
      $or: [
        { image: { $exists: false } },
        { image: null },
        { name: { $exists: false } },
        { price: { $exists: false } },
        { description: { $exists: false } },
        { category: { $exists: false } },
        { gender: { $exists: false } },
        { season: { $exists: false } },
      ],
    });

    console.log(`products_total: ${total}`);
    console.log(`products_remote_images: ${remote}`);
    console.log(`products_local_image_paths: ${localStyle}`);
    console.log(`products_missing_required: ${missingRequired}`);
  } catch (error) {
    console.error("verify_failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
