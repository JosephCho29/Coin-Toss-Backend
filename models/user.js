const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  bets: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Event",
    default: [],
  },
  friends: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  events: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Event",
  },
  tokens: {
    type: Number,
    default: 100,
  },
  profilePhoto: { type: String },
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

module.exports = mongoose.model("User", userSchema);
