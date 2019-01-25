const functions = require('firebase-functions');
const { createSearchUrl, fetch, prepareItem } = require('./utilities');

exports.search = async (req, res) => {
  try {
    const url = createSearchUrl(req.query, functions.config().search.key);
    const results = await fetch(url);
    if (results.error) {
      console.error(results.error);
      throw new Error('API request error');
    }
    if (Array.isArray(results.items)) {
      results.items = results.items.map(prepareItem);
    } else {
      results.items = [];
    }
    res.send(results);
  } catch (e) {
    // log the error to StackDriver
    console.error(e);
    res.send({ error: true, items: [] });
  }
};
