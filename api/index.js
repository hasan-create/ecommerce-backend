const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const serverless = require("serverless-http");

// ROUTES
const authRoutes = require("../route/auth");
const productRoutes = require("../route/products");
const cartRoutes = require("../route/cart");
const feedbackRoutes = require("../route/feedback");
const orderRoutes = require("../route/order");

const app = express();

// ----------------------
// DB (serverless-safe)
// ----------------------
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB error:", err);
    throw err;
  }
}

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ----------------------
// MIDDLEWARES
// ----------------------
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// ----------------------
// ROUTES
// ----------------------
app.get("/api", (req, res) => {
  res.json({ status: "API working" });
});

app.use("/api/auth", authRoutes);
app.use("/api", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/order", orderRoutes);

// ----------------------
module.exports = serverless(app);
