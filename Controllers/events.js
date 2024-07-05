const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Event = require("../models/event.js");
const User = require("../models/user.js");
const router = express.Router();

router.use(verifyToken);

router.post("/", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    req.body.author = req.user._id;
    if (req.body.closeOut) {
      req.body.closeOut = Date.now() + req.body.closeOut * 60 * 1000;
      const event = await Event.create(req.body);
      event.owner = req.user._id;
      user.events.push(event._id);
      user.save();
      return res.status(201).json(event);
    } else {
      const event = await Event.create(req.body);
      event.owner = req.user._id;
      user.events.push(event._id);
      event.save();
      user.save();
      res.status(201).json(event);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const events = await Event.find({}).sort({ createdAt: "desc" });
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

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (user.tokens < amount) {
      return res.status(400).json({ error: "Not enough tokens" });
    }

    if (event.betAmount !== amount) {
      return res.status(400).json({ error: "This is not the bet amount" });
    }

    if (event.closeOut < Date.now()) {
      return res.status(400).json({ error: "Event is closed" });
    }

    const bet = { ...req.body, better: userId };
    event.betters.push(bet);
    event.pot += amount;
    await event.save();

    user.tokens -= amount;
    const newBet = event.betters[event.betters.length - 1];
    user.bets.push(eventId);
    await user.save();

    newBet.better = req.user;

    res.status(201).json(newBet);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

router.get("/:eventId/claim", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.closeOut <= Date.now() && event.pot === 0) {
      return res
        .status(400)
        .json({ error: "Event is closed and tokens were claimed" });
    }

    const winners = event.betters
      .filter((better) => better.winningCondition === event.winningCondition)
      .map((better) => better.better);

    if (winners.length === 0) {
      return res.status(404).json({ error: "No winners" });
    }

    const winningsPerPerson = Math.floor(event.pot / winners.length); // do we want the users to have fractions tokens?

    const updatedUsers = [];

    for (const winnerId of winners) {
      const user = await User.findById(winnerId);
      user.tokens += winningsPerPerson;
      await user.save();
      updatedUsers.push(user.username);
    }

    event.pot = 0;
    event.closeOut = Date.now();
    await event.save();

    res.status(200).json({
      message: "Winnings claimed successfully",
      winners: updatedUsers,
      totalDistributed: winningsPerPerson * winners.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
