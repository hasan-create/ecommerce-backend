// const express = require("express");
// const router = express.Router();
// const Cart = require("./cartSchema");
// const jwt = require("jsonwebtoken");

// function verifyToken(req, res, next) {
//   const token = req.cookies.token; 

//   if (!token) return res.status(401).json({ message: "No token provided" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.userEmail = decoded.email;
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: "Invalid token" });
//   }
// }


// router.post("/add", verifyToken, async (req, res) => {
//   const { name, price, image} = req.body;
//   const userEmail = req.userEmail;

//   try {
//     let cart = await Cart.findOne({ userEmail });

//     if (cart) {
//       const existingProduct = cart.Products.find((p) => p.Name === name);
//       if (existingProduct) {
//         existingProduct.quantity += 1;
//       } else {
//         cart.Products.push({ Name: name, price, image });
//       }

//       await cart.save();
//       res.json({ message: "Cart updated", cart });
//     } else {
//       const newCart = new Cart({
//         userEmail,
//         Products: [{ Name: name, price, image }],
//       });
//       await newCart.save();
//       res.json({ message: "New cart created", cart: newCart });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// router.post("/add", verifyToken, async (req, res) => {
//   const { productId, name, price, image } = req.body;
//   console.log(productId)
//   if (!productId || !name || !price || !image) {
//     return res.status(400).json({ message: "Missing product info" });
//   }
//   const userEmail = req.userEmail;
//   try {
//     let cart = await Cart.findOne({ userEmail });
//     if (cart) {
//       const existing = cart.Products.find((p) => p.productId === productId);
//       if (existing) existing.quantity += 1;
//       else cart.Products.push({ productId, Name: name, price, image, quantity: 1 });
//       await cart.save();
//       res.json({ message: "Cart updated", cart });
//     } else {
//       const newCart = new Cart({
//         userEmail,
//         Products: [{ productId, Name: name, price, image, quantity: 1 }],
//       });
//       await newCart.save();
//       res.json({ message: "New cart created", cart: newCart });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });



// router.get("/", verifyToken, async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ userEmail: req.userEmail });
//     if (!cart) return res.status(404).json({ message: "Cart not found" });
//     res.json(cart);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// router.delete("/delete/:name", verifyToken, async (req, res) => {
//   const { name } = req.params;
//   const userEmail = req.userEmail;

//   try {
//     const cart = await Cart.findOne({ userEmail });
//     if (!cart) return res.status(404).json({ message: "Cart not found" });

//     cart.Products = cart.Products.filter((p) => p.Name !== name);

//     await cart.save();
//     res.json({ message: "Product removed", cart });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const Cart = require("./cartSchema");
const jwt = require("jsonwebtoken");

// ------------------ JWT middleware ------------------
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

// ------------------ Add to Cart ------------------
// router.post("/add", verifyToken, async (req, res) => {
//   const { productId, name, price, image } = req.body;
//   if (!productId || !name || !price || !image) {
//     return res.status(400).json({ message: "Missing product info" });
//   }
//   const userEmail = req.userEmail;
//   try {
//     let cart = await Cart.findOne({ userEmail });
//     if (cart) {
//       const existing = cart.Products.find((p) => p.productId.toString() === productId);
//       if (existing) existing.quantity += 1;
//       else cart.Products.push({ productId, Name: name, price, image, quantity: 1 });
//       await cart.save();
//       res.json({ message: "Cart updated", cart });
//     } else {
//       const newCart = new Cart({
//         userEmail,
//         Products: [{ productId, Name: name, price, image, quantity: 1 }],
//       });
//       await newCart.save();
//       res.json({ message: "New cart created", cart: newCart });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });
router.post("/add", verifyToken, async (req, res) => {
  const { productId, name, price, image } = req.body;
  
  if (!productId || !name || !price || !image) {
    return res.status(400).json({ message: "Missing product info" });
  }
  const userEmail = req.userEmail;
  try {
    let cart = await Cart.findOne({ userEmail });
    if (cart) {
      const existing = cart.Products.find(
        (p) => p.productId && p.productId.toString() === productId
      );
      if (existing) existing.quantity += 1;
      else cart.Products.push({ productId, Name: name, price, image, quantity: 1 });

      await cart.save();
      res.json({ message: "Cart updated", cart });
    } else {
      const newCart = new Cart({
        userEmail,
        Products: [{ productId, Name: name, price, image, quantity: 1 }],
      });
      await newCart.save();
      res.json({ message: "New cart created", cart: newCart });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ Get Cart ------------------
router.get("/", verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userEmail: req.userEmail });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ Delete from Cart ------------------
router.delete("/delete/:productId", verifyToken, async (req, res) => {
  const { productId } = req.params;
  const userEmail = req.userEmail;
  try {
    const cart = await Cart.findOne({ userEmail });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.Products = cart.Products.filter((p) => p.productId.toString() !== productId);
    await cart.save();
    res.json({ message: "Product removed", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
