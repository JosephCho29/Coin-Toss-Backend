const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Event = require("../models/event.js");
const router = express.Router();

router.use(verifyToken);

router.post("/", async (req, res) => {
  try {
    req.body.author = req.user._id;
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const event = await Event.find({})
      .populate("author")
      .sort({ createdAt: "desc" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate([
      "betters",
    ]);
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/:eventId/bet", async (req, res) => {
  try {
    req.body.author = req.user._id;
    const event = await Event.findById(req.params.eventId);
    event.betters.push(req.body);
    await event.save();

    // Find the newly created comment:
    const newBet = event.betters[event.betters.length - 1];

    newBet._doc.better = req.user;

    // Respond with the newComment:
    res.status(201).json(newBet);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
