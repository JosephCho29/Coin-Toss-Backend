const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcrypt");

const SALT_LENGTH = 12;

const User = require("../models/user");
const Event = require("../models/event");
const events = [
  {
    title: "able",
    description: "1234",
    winningCondition: "A",
    betAmount: 10,
    closeOut: 8,
  },
  {
    username: "cable",
    password: "1234",
  },
  {
    username: "bible",
    password: "1234",
  },
  {
    username: "table",
    password: "1234",
  },
];

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", async () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
  await User.collection.drop();

  await User.create(
    events.map((event) => {
      let x = {
        username: event.username,
        description: event.description,
      };
      console.log(x);
      return x;
    }),
  );

  console.log("Users Created!");
  process.exit();
});
