const mongoose = require ("mongoose")
const dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcrypt');

const SALT_LENGTH = 12;

 const User = require("../models/user")
const users = [{
    username: "able",
    password: "1234"
 },
 {
    username : "cable",
    password: "1234"
 },
 {
        username: "bible",
        password: "1234"
},
{
        username: "table",
        password: "1234"
    }
]

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', async () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
    await User.collection.drop()

    await User.create(
        users.map(user => {
            let x = { username: user.username, hashedPassword: bcrypt.hashSync(user.password, SALT_LENGTH) }
        console.log(x)
        return x
        })
    )
    
    console.log("Users Created!")
    process.exit()
});
