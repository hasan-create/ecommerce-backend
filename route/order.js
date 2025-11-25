
const express = require("express");
const router = express.Router();
const Order = require("./orderSchema"); 
const Cart = require("./cartSchema");
const jwt = require("jsonwebtoken");


function verifyToken(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}


router.post("/place", verifyToken, async (req, res) => {
  try {
    const userEmail = req.userEmail;

    const {
      fullName,
      lastName,
      email,
      address,
      paymentMethod,
      products, 
      shippingAmount, 
      usedCart, 
    } = req.body;

 
    let orderProducts = products;
    if (!orderProducts || !Array.isArray(orderProducts) || orderProducts.length === 0) {
      const cart = await Cart.findOne({ userEmail });
      if (!cart || !cart.Products || cart.Products.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      orderProducts = cart.Products.map((p) => ({
        Name: p.Name || p.name,
        price: p.price,
        quantity: p.quantity || 1,
      }));
    }


    const subtotal = orderProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const serverShipping = Number((subtotal * 0.01).toFixed(2));
    const totalAmount = Number((subtotal + serverShipping).toFixed(2));

    const newOrder = new Order({
      userEmail,
      fullName,
      lastName,
      email,
      products: orderProducts,
      subtotal,
      shippingAmount: serverShipping,
      totalAmount,
      address: {
        street: address?.street || "",
        city: address?.city || "",
        state: address?.state || "",
        zipCode: address?.zipCode || "",
        country: address?.country || "",
        pincode: address?.pincode || "",
      },
      paymentMethod,
      status: "Pending",
    });

    await newOrder.save();


    if (usedCart) {
      const cart = await Cart.findOne({ userEmail });
      if (cart) {
        cart.Products = [];
        await cart.save();
      }
    }

    res.json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    console.error("Order place error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/", verifyToken, async (req, res) => {
  const userEmail = req.userEmail;
  try {
    const orders = await Order.find({ userEmail }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/admin", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();
    res.json({ message: "Status updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
