const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');


const usersRouter = require('./controllers/users');
const eventsRouter = require('./controllers/events');
const testJWTRouter = require('./controllers/test-jwt');

app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors()); 
app.use(express.json());
app.use('/test-jwt', testJWTRouter);
app.use('/events', eventsRouter);
app.use('/users', usersRouter);

app.listen(3000, () => {
    console.log('The express app is ready!');
});