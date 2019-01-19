const functions = require('firebase-functions');

exports.search = functions.https.onRequest((req, res) => {
  res.send([]);
});
