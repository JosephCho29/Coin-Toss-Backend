const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verify-token");

const SALT_LENGTH = 12;

router.post("/signup", async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
      return res.json({ error: "Username already taken." });
    }
    const user = await User.create({
      username: req.body.username,
      hashedPassword: bcrypt.hashSync(req.body.password, SALT_LENGTH),
      profilePhoto: req.body.profilePhoto,
    });
    const token = jwt.sign(
      { username: user.username, _id: user._id },
      process.env.JWT_SECRET,
    );
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user && bcrypt.compareSync(req.body.password, user.hashedPassword)) {
      const token = jwt.sign(
        { username: user.username, _id: user._id },
        process.env.JWT_SECRET,
      );
      res.status(200).json({ token });
    } else {
      res.status(401).json({ error: "Invalid username or password." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// search for users
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (user) {
      return res.status(200).json({ user });
    }
    res.status(404).json({ error: "User not found" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//add a user as a friend
router.post("/:userId/add-friend", verifyToken, async (req, res) => {
  try {
    const friendId = req.params.userId;
    const user = await User.findById(req.user._id);

    if (req.user._id === friendId) {
      return res
        .status(400)
        .json({ error: "You can't add yourself as a friend" });
    }

    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.friends.includes(friendId)) {
      return res.status(400).json({ error: "Already friends with this user" });
    }

    user.friends.push(friendId);
    await user.save();

    friend.friends.push(req.user._id);
    await friend.save();

    res.status(200).json({ message: "Friend added successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:userId", verifyToken, async (req, res) => {
  try {
    if (req.user._id !== req.params.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
    });
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:userId", verifyToken, async (req, res) => {
  try {
    if (req.user._id !== req.params.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await User.findByIdAndDelete(req.params.userId);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
