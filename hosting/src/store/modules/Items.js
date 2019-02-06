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

/**
 * The current searched value has not changed
 */
const isNewSearch = ({ searchValue, cachedSearch }) => searchValue === cachedSearch;

/**
 * The requested start index for the current search value exists in memory
 */
const itemsAreInCache = ({ startIndex, cachedItems }) => Array.isArray(cachedItems[startIndex]);

const moduleState = {
  error: false,
  cachedSearch: '',
  cachedItems: {},
  items: [],
  totalItems: 0,
  searchValue: '',
  startIndex: 0,
  encodedSearchString,
  requestUrl,
  isNewSearch,
  itemsAreInCache,
};

class ItemsModule extends StoreModule {
  oncreate(fetch) {
    // wrap `fetch` to avoid changing `fetch`'s context of `this`
    this._fetch = (...args) => fetch(...args);
    return moduleState;
  }

  clearCache() {
    this.set({ cachedSearch: '', cachedItems: {} });
  }

  // eslint-disable-next-line consistent-return
  async getItems({ searchValue, paginationState: { currentPage }, itemsPerRequest }) {
    // return error when searchValue isn't a valid string
    if (!searchValue || typeof searchValue !== 'string') {
      return this.set({ error: true, items: [], totalItems: 0 });
    }

    this.searchValue = searchValue;
    if (!this.isNewSearch) {
      this.clearCache();
    }

    this.cachedSearch = searchValue;
    this._setStartIndex(currentPage, itemsPerRequest);

    if (this.itemsAreInCache) {
      this._fetchItemsFromCache();
    } else {
      await this._fetchItemsFromApi();
    }
  }

  /**
   * Store results from API in memory
   */
  _addItemsToCache() {
    const { cachedItems } = this.get();
    cachedItems[this.startIndex] = this.items;
    this.set({ cachedItems });
  }

  /**
   *  Calculate the current starting index for items in api requests
   */
  _setStartIndex(currentPage, itemsPerRequest) {
    const isValidNumber = numValue => Number(numValue) > 0;

    if (!isValidNumber(currentPage) || !isValidNumber(itemsPerRequest)) {
      this.startIndex = 0;
      return;
    }

    this.startIndex = (currentPage - 1) * itemsPerRequest;
  }

  /**
   * Fetch items from Google Books API (via server functions)
   */
  async _fetchItemsFromApi() {
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
      this.set({ error: false, items, totalItems });
      this._addItemsToCache();
    } catch (err) {
      this.set({ error: true, items: [], totalItems: 0 });
    }
  }

  /**
   * Return previously-fetched items from in-memory cache
   */
  _fetchItemsFromCache() {
    const items = this.cachedItems[this.startIndex];
    this.set({ items });
  }
}

// export compute functions for tests
module.exports = {
  ItemsModule,
  requestUrl,
  encodedSearchString,
};
