const functions = require('firebase-functions');
const { createSearchUrl, fetch } = require('./utilities');

exports.search = async (req, res) => {
  try {
    const url = createSearchUrl(req.query, functions.config().search.key);
    const results = await fetch(url);
    if (results.error) {
      throw new Error(results.error);
    }
    res.send(results);
  } catch (e) {
    // log the error to StackDriver
    console.error(e);
    res.send({ error: true, items: [] });
  }
};
