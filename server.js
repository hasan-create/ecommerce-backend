
const dotenv = require("dotenv");
dotenv.config();

const feedbackRoutes = require("./route/feedback");
const orderRoutes = require("./route/order");

const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const authRoutes = require("./route/auth");
const productRoutes = require("./route/products");
const cartRoutes = require("./route/cart");

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/ecommerse";
const CLIENT_URLS = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

// ----------------------
// CONNECT 
// ----------------------
mongoose
  .connect(MONGODB_URL)
  .then(() => console.log("MongoDB connection success"))
  .catch((err) => console.log(err));

// ----------------------
// IMPORTANT: Disable Cache for Auth Security
// ----------------------
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// ----------------------
// MIDDLEWARES
// ----------------------
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || CLIENT_URLS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// ----------------------
// ROUTES
// ----------------------
app.use("/api/auth", authRoutes);      // login, logout, signup
app.use("/api", productRoutes);        // products
app.use("/api/cart", cartRoutes);      // cart
app.use("/api/feedback", feedbackRoutes);
app.use("/api/order", orderRoutes);

// ----------------------
// START SERVER
// ----------------------
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
