const { StoreModule } = require('../StoreModule');

// ENVIRONMENT is replaced with 'dev' / 'prod' on serve / build
// eslint-disable-next-line no-constant-condition
const baseUrl = 'ENVIRONMENT' === 'dev'
  ? 'http://localhost:5000/book-inquiry/us-central1/api/'
  : 'https://us-central1-book-inquiry.cloudfunctions.net/api/';

/**
 * Construct request url
 */
const requestUrl = ({ encodedSearchString, startIndex }) => `${baseUrl}search?q=${encodedSearchString}&startIndex=${startIndex}`;

/**
 *  Protect against invalid itemIndex input
 */
const startIndex = ({ itemIndex }) => {
  const indexNumber = Number(itemIndex);
  if (!Number.isNaN(indexNumber) && indexNumber >= 0) {
    return indexNumber;
  }
  return 0;
};

/**
 * Encode the searchValue to be URI safe
 */
const encodedSearchString = ({ searchValue }) => encodeURIComponent(searchValue);

const moduleState = {
  error: false,
  items: [],
  totalItems: 0,
  itemIndex: 0,
  searchValue: '',
  encodedSearchString,
  startIndex,
  requestUrl,
};

class ItemsModule extends StoreModule {
  oncreate(fetch) {
    // wrap `fetch` to avoid changing `fetch`'s context of `this`
    this._fetch = (...args) => fetch(...args);
    return moduleState;
  }

  async getItems({ searchValue, currentIndex: itemIndex }) {
    // return error when searchValue isn't a valid string
    if (!searchValue || typeof searchValue !== 'string') {
      return this.set({ error: true, items: [], totalItems: 0 });
    }

    this.set({ itemIndex, searchValue });

    try {
      const response = await this._fetch(this.requestUrl);

      // error making the http request
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const { items, totalItems, error } = await response.json();

      // error on the server
      if (error) {
        throw new Error(error);
      }
      return this.set({ error: false, items, totalItems });
    } catch (err) {
      return this.set({ error: true, items: [], totalItems: 0 });
    }
  }
}

// export compute functions for tests
module.exports = {
  ItemsModule,
  requestUrl,
  startIndex,
  encodedSearchString,
};
