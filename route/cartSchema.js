
// const mongoose = require("mongoose");

// const cartSchema = new mongoose.Schema(
//   {
//     userEmail: {
//       type: String,
//       required: true,
//       unique: true, 
//     },
//     Products: [
//       {
//         Name: {
//           type: String,
//           required: true,
//         },
//         price: {
//           type: Number,
//           required: true,
//         },
//         image: {
//           type: String,
//           required: true,
//         },
//         quantity: {
//           type: Number,
//           default: 1, 
//         },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// const Cart = mongoose.model("Cart", cartSchema);
// module.exports = Cart;
// const mongoose = require("mongoose");

// const cartSchema = new mongoose.Schema(
//   {
//     userEmail: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     Products: [
//       {
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         Name: {
//           type: String,
//           required: true,
//         },
//         price: {
//           type: Number,
//           required: true,
//         },
//         image: {
//           type: String,
//           required: true,
//         },
//         quantity: {
//           type: Number,
//           default: 1,
//         },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// const Cart = mongoose.model("Cart", cartSchema);
// module.exports = Cart;
// const mongoose = require("mongoose");

// const cartSchema = new mongoose.Schema(
//   {
//     userEmail: { type: String, required: true, unique: true },
//     Products: [
//       {
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         Name: { type: String, required: true },
//         price: { type: Number, required: true },
//         image: { type: String, required: true },
//         quantity: { type: Number, default: 1 },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// const Cart = mongoose.model("Cart", cartSchema);
// module.exports = Cart;
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, unique: true },
    Products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        Name: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
