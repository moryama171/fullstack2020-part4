const config = require('./utils/config');

const express = require('express');
require('express-async-errors');

const app = express();

const cors = require('cors');
const blogsRouter = require('./controllers/blogs');
const middleware = require('./utils/middleware');
const mongoose = require('mongoose');

const mongoUrl = config.MONGODB_URI;
if (process.env.NODE_ENV !== 'test') {
  console.log('Connect to database', mongoUrl);
}
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

app.use(cors());
app.use(express.json());
app.use('/api/blogs', blogsRouter);

app.use(middleware.errorHandler);

module.exports = app;
