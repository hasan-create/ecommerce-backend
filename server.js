require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const authRoutes = require("./route/auth");
const productRoutes = require("./route/products");
const cartRoutes = require("./route/cart");
const feedbackRoutes = require("./route/feedback");
const orderRoutes = require("./route/order");

const app = express();

// DB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// MIDDLEWARE
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/order", orderRoutes);

// START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
