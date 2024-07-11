const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/verify-token", (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ decoded });
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
});

module.exports = router;
