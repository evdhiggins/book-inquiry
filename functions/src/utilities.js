const https = require('https');
const assert = require('assert');

// Generate a valid url from apiKey and user-defined q / startIndex
// An error is thowing if `q` or `apiKey` are invalid
exports.createSearchUrl = ({ q, startIndex }, key) => {
  const qIsValid = typeof q === 'string' && q !== '';
  const keyIsValid = typeof key === 'string' && key !== '';

  assert(qIsValid, 'Missing valid search query input');
  assert(keyIsValid, 'Missing api key');

  // only suppport non-negative startIndex less than Number.MAX_SAFE_INTEGER
  const indexNumber = Number(startIndex);
  const index = indexNumber > 0 && indexNumber < Number.MAX_SAFE_INTEGER ? indexNumber : 0;

  // fields to be requested from Google Books API
  const fields = [
    'totalItems',
    'items/id',
    // start volumeInfo
    'items/volumeInfo(title',
    'authors',
    'publisher',
    'imageLinks/thumbnail',
    'infoLink)',
    // end volumeInfo
    'items/searchInfo/textSnippet',
  ];

  let url = 'https://www.googleapis.com/books/v1/volumes?';
  url += `q=${q}`;
  url += `&startIndex=${index}`;
  url += '&maxResults=5';
  url += `&fields=${fields.join(',')}`;
  url += `&key=${key}`;

  return url;
};

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
