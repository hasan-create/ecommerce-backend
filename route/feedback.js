const express = require("express");
const router = express.Router();
const Feedback = require("./feedbackSchema");
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}


router.post("/add", verifyToken, async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userEmail = req.userEmail;

  try {
    const newFeedback = new Feedback({ productId, userEmail, rating, comment });
    await newFeedback.save();
    res.json({ message: "Feedback added", feedback: newFeedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:productId", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
