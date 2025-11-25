
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Product = require("./productschema");

// -------------------- MULTER SETUP --------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("image");

// -------------------- ADD NEW PRODUCT --------------------
router.post("/products", (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ message: "File upload failed" });
    if (!req.file)
      return res.status(400).json({ message: "No image uploaded" });

    try {
      const { name, size, price, description, category, season, gender } =
        req.body;
      const imagePath = req.file.path;

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
