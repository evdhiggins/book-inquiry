const https = require('https');
const assert = require('assert');
const { countryCodes } = require('./countryCodes');

// Generate a valid url from apiKey and user-defined q / startIndex
// An error is thowing if `q` or `apiKey` are invalid
exports.createSearchUrl = ({
  q, startIndex, country, resultsPerPage, key,
}) => {
  const qIsValid = typeof q === 'string' && q !== '';
  const keyIsValid = typeof key === 'string' && key !== '';

  assert(qIsValid, 'Missing valid search query input');
  assert(keyIsValid, 'Missing api key');

  // only suppport non-negative startIndex less than Number.MAX_SAFE_INTEGER
  const indexNumber = Number(startIndex);
  const index = indexNumber > 0 && indexNumber < Number.MAX_SAFE_INTEGER ? indexNumber : 0;

  // ensure that maxResults is between 1 and 40 (inclusive)
  const maxResultsNumber = Number(resultsPerPage);
  let maxResults;
  switch (true) {
    case Number.isNaN(maxResultsNumber):
    case maxResultsNumber === 0 && resultsPerPage !== 0: // Number(null) === Number('') === 0
      maxResults = 20;
      break;
    case maxResultsNumber < 1:
      maxResults = 1;
      break;
    case maxResultsNumber > 40:
      maxResults = 40;
      break;
    default:
      maxResults = maxResultsNumber;
  }

  // only allow official 2-character country codes
  const countryCode = countryCodes.includes(country) ? country : 'US';

  // fields to be requested from Google Books API
  const fields = [
    'totalItems',
    'items/id',
    // start volumeInfo
    'items/volumeInfo(title',
    'authors',
    'description',
    'publisher',
    'imageLinks/thumbnail',
    'infoLink)',
    // end volumeInfo
    'items/searchInfo/textSnippet',
  ];

  let url = 'https://www.googleapis.com/books/v1/volumes?';
  url += `q=${encodeURIComponent(q)}`;
  url += `&startIndex=${index}`;
  url += `&country=${countryCode}`;
  url += `&maxResults=${maxResults}`;
  url += `&fields=${fields.join(',')}`;
  url += `&key=${key}`;

  return url;
};

// fetch and parse data from a json endpoint
exports.fetch = url => new Promise((res, rej) => {
  let responseData = '';
  https
    .get(url, (response) => {
      response.on('data', (chunk) => {
        responseData += chunk;
      });
      response.on('end', () => {
        res(JSON.parse(responseData));
      });
    })
    .on('error', (error) => {
      rej(error);
    });
});

// flatten an API item, setting missing fields to defaults
// and modify fields to match desired structure
exports.prepareItem = (apiItem = {}) => {
  // default argument doesn't catch null values
  const item = apiItem === null ? {} : apiItem;

  // root-level item properties
  const { id = '', volumeInfo = {}, searchInfo = {} } = item;

  // volumeInfo properties
  const { title = '', publisher = '', imageLinks = {} } = volumeInfo;

  let { authors = [], infoLink = '', description = '' } = volumeInfo;
  authors = authors.join(', ');
  infoLink = infoLink.replace(/^http:/, 'https:');

  // remove curled-corner modifier from images
  let thumbnail = imageLinks.thumbnail || '';
  thumbnail = thumbnail.replace(/&edge=curl/, '').replace(/^http:/, 'https:');

  // searchInfo properties
  const { textSnippet = '' } = searchInfo;

  description = description || textSnippet;

  try {
    // some of the item descriptions contain URI encoded strings
    description = decodeURI(description);
  } catch (_) {
    // do nothing if there is an error decoding the URI
  }

  // remove any html tags in description
  // this is for presentation and not security, so a simple regexp is fine
  description = description.replace(/<.*?>/g, '');

  return {
    id,
    description,
    title,
    authors,
    publisher,
    thumbnail,
    infoLink,
  };
};
