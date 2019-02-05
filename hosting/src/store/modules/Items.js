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
 * Encode the searchValue to be URI safe
 */
const encodedSearchString = ({ searchValue }) => encodeURIComponent(searchValue);

const moduleState = {
  error: false,
  items: [],
  totalItems: 0,
  searchValue: '',
  startIndex: 0,
  encodedSearchString,
  requestUrl,
};

class ItemsModule extends StoreModule {
  oncreate(fetch) {
    // wrap `fetch` to avoid changing `fetch`'s context of `this`
    this._fetch = (...args) => fetch(...args);
    return moduleState;
  }

  async getItems({ searchValue, paginationState: { currentPage }, itemsPerRequest }) {
    // return error when searchValue isn't a valid string
    if (!searchValue || typeof searchValue !== 'string') {
      return this.set({ error: true, items: [], totalItems: 0 });
    }

    this.searchValue = searchValue;
    this._getStartIndex(currentPage, itemsPerRequest);

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

  /**
   *  Calculate the current starting index for items in api requests
   */
  _getStartIndex(currentPage, itemsPerRequest) {
    const isValidNumber = numValue => Number(numValue) > 0;

    if (!isValidNumber(currentPage) || !isValidNumber(itemsPerRequest)) {
      this.startIndex = 0;
      return;
    }

    this.startIndex = (currentPage - 1) * itemsPerRequest;
  }
}

// export compute functions for tests
module.exports = {
  ItemsModule,
  requestUrl,
  encodedSearchString,
};
