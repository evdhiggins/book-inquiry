const cors = require('cors');
const express = require('express');
const functions = require('firebase-functions');
const { search } = require('./src/routes/search');
const { ping } = require('./src/routes/ping');

const app = express();

const corsOptions = {
  origin: functions.config().env === 'dev' ? true : /https?:\/\/book-inquiry\.firebaseapp\.com/,
};
app.use(cors(corsOptions));

app.get('/search', search);
app.get('/ping', ping);

exports.api = functions.https.onRequest(app);
