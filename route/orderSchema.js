
const mongoose = require("mongoose");

const productSubSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },

    fullName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },

    products: [productSubSchema],

    subtotal: { type: Number, required: true },
    shippingAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    paymentMethod: { type: String, enum: ["UPI", "COD", "Card"], required: true },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
