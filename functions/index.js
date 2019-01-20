const cors = require('cors')({ origin: true });
const express = require('express');
const functions = require('firebase-functions');
const { search } = require('./src/search');

const app = express();
app.use(cors);

app.get('/search', search);

exports.api = functions.https.onRequest(app);
