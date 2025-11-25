// const dotenv = require("dotenv");
// dotenv.config();
// const feedbackRoutes = require("./route/feedback");
// const orderRoutes = require("./route/order");



// const express = require("express");
// const app = express();
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const mongoose = require("mongoose");

// const authRoutes = require("./route/auth");
// const productRoutes = require("./route/products");
// const cartRoutes = require("./route/cart");


// mongoose
//   .connect("mongodb://127.0.0.1:27017/ecommerse")
//   .then(() => console.log("MongoDB connection success"))
//   .catch((err) => console.log(err));

// app.use(cookieParser());
// app.use(
//   cors({
//     origin: "http://localhost:5173", 
//     credentials: true, 
//   })
// );
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use("/uploads", express.static("uploads"));


// app.use("/api/auth", authRoutes);
// app.use("/api/", productRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/feedback", feedbackRoutes);
// app.use("/api/order", orderRoutes);
// app.listen(3000, () => {
//   console.log("Server started at port 3000");
// });
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

// ----------------------
// CONNECT MONGO
// ----------------------
mongoose
  .connect("mongodb://127.0.0.1:27017/ecommerse")
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
    origin: "http://localhost:5173", // your React frontend
    credentials: true,               // allow cookies
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
app.listen(3000, () => {
  console.log("Server started at port 3000");
});
