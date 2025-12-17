const express = require("express");
const router = express.Router();
const Product = require("./productschema");
const upload = require("../middleware/upload");

// ADD PRODUCT
router.post("/products", upload.single("image"), async (req, res) => {
  try {
    console.log("FILE 👉", req.file);
    console.log("BODY 👉", req.body);

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const { name, size, price, description, category, season, gender } = req.body;

    const newProduct = new Product({
      image: req.file.path,        // Cloudinary URL
      name,
      size,
      price: Number(price),        // ✅ IMPORTANT FIX
      description,
      category,
      season,
      gender,
    });

    await newProduct.save();
    res.status(200).json({ message: "Item added successfully" });
  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    res.status(500).json({ message: "Error saving product", error: err.message });
  }
});

// GET PRODUCTS
router.get("/products", async (req, res) => {
  try {
    const { gender, category, search } = req.query;
    const filter = {};

    if (gender) filter.gender = new RegExp(`^${gender}$`, "i");
    if (category) filter.category = new RegExp(`^${category}$`, "i");

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET SINGLE PRODUCT
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
