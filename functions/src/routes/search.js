const functions = require('firebase-functions');
const { createSearchUrl, fetch, prepareItem } = require('../utilities');

exports.search = async (req, res) => {
  try {
    const urlParams = {
      // default values
      startIndex: 0,
      country: 'US',
      resultsPerPage: 20,

      // override defaults with values in request
      ...req.query,

      // don't allow key override
      key: functions.config().search.key,
    };
    const url = createSearchUrl(urlParams);
    const results = await fetch(url);
    if (results.error) {
      // log the full http error to StackDriver
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
