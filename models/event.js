const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  winningCondition: {
    type: String,
    required: true,
  },
  better: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  amount: {
    type: Number,
    required: true,
  },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    winningCondition: {
      type: String,
      required: true,
    },
    pot: {
      type: Number,
      default: 0,
    },
    betAmount: {
      type: Number,
      required: true,
    },
    betters: [betSchema],
    closeOut: {
      type: Date,
      required: true,
      default: Date.now() + 60 * 60 * 1000,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
