
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
