const cors = require('cors');
const express = require('express');
const functions = require('firebase-functions');
const { search } = require('./src/search');

const app = express();

const corsOptions = {
  origin: functions.config().env === 'dev' ? true : /https?:\/\/book-inquiry\.firebaseapp\.com/,
};
app.use(cors(corsOptions));

app.get('/search', search);

exports.api = functions.https.onRequest(app);
