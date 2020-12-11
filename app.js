require('dotenv').config();

const express = require('express');
const app = express();

const cors = require('cors');
const blogsRouter = require('./controllers/blogs');
const mongoose = require('mongoose');


const mongoUrl = process.env.MONGODB_URI;
console.log('Connect to database', mongoUrl);
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

app.use(cors());
app.use(express.json());
app.use('/api/blogs', blogsRouter);

module.exports = app;

