// ENVIRONMENT is replaced with 'dev' / 'prod' on serve / build
// eslint-disable-next-line no-constant-condition
const baseUrl = 'ENVIRONMENT' === 'dev'
  ? 'http://localhost:5000/book-inquiry/us-central1/api/'
  : 'https://us-central1-book-inquiry.cloudfunctions.net/api/';

class ItemStore {
  constructor(fetch) {
    // wrap `fetch` to avoid changing `fetch`'s context of `this`
    const fetchWrapper = (...args) => fetch(...args);
    this._fetch = fetchWrapper;
  }

  async getItems({ searchValue, itemIndex }) {
    // return error when searchValue isn't a valid string
    if (!searchValue || typeof searchValue !== 'string') {
      return { error: true, items: [], totalItems: 0 };
    }

    try {
      const encodedSearchString = encodeURI(searchValue);

      // if itemIndex isn't a valid value, silently default to 0
      const startIndex = !Number.isNaN(Number(itemIndex)) && Number(itemIndex) > -1 ? itemIndex : 0;
      const requestUrl = `${baseUrl}search?q=${encodedSearchString}&startIndex=${startIndex}`;
      const response = await this._fetch(requestUrl);

      // error making the http request
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const { items, totalItems, error } = await response.json();

      // error on the server
      if (error) {
        throw new Error(error);
      }
      return { error: false, items, totalItems };
    } catch (err) {
      return { error: true, items: [], totalItems: 0 };
    }
  }
}

module.exports = { ItemStore };
