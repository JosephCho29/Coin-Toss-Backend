const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Event = require("../models/event.js");
const User = require("../models/user.js");
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
    const events = await Event.find({})
      .populate({
        path: "betters",
        populate: {
          path: "better",
          select: "username",
          model: "User",
        },
      })
      .sort({ createdAt: "desc" });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate({
      path: "betters",
      populate: {
        path: "better",
        select: "username",
        model: "User",
      },
    });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/:eventId/bet", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { _id: userId } = req.user;
    const { amount } = req.body;

    const event = await Event.findById(eventId);
    const user = await User.findById(userId);

    if (!event || !user) {
      return res.status(404).json({ error: "Event or User not found" });
    }

    const bet = { ...req.body, better: userId };
    event.betters.push(bet);
    event.pot += amount;
    await event.save();

    user.tokens -= amount;
    const newBet = event.betters[event.betters.length - 1];
    user.bets.push(newBet._id);
    await user.save();

    newBet.better = req.user;

    res.status(201).json(newBet);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

module.exports = router;
