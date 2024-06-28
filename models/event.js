const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  winningCondition: {
    type: String,
    required: true,
  },
  better: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  amount: {
    type: Number,
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
    betters: [betSchema],
  },
  { timestamps: true },
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
