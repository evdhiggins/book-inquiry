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

/**
 * Used by prefetch. Check to see if next page of items already exist in cache
 */
const nextPageIsCached = ({ cachedItems, startIndex, itemsPerRequest }) => {
  const key = startIndex + itemsPerRequest;
  return Array.isArray(cachedItems[key]);
};

const moduleState = {
  error: false,
  cachedSearch: '',
  cachedItems: {},
  items: [],
  totalItems: 0,
  searchValue: '',
  startIndex: 0,

  // saved for pre-fetch use
  currentPage: 1,
  itemsPerRequest: 20,

  // computed state
  encodedSearchString,
  requestUrl,
  isNewSearch,
  itemsAreInCache,
  nextPageIsCached,
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

    this.set({ currentPage, searchValue, itemsPerRequest });
    if (!this.isNewSearch) {
      this.clearCache();
    }

    this.cachedSearch = searchValue;
    this._setStartIndex(currentPage, itemsPerRequest);

    if (!this.itemsAreInCache) {
      // fetch items from api and save in cache, but do not set as active
      await this._fetchItemsFromApi();
    }
    // set cache items as active
    this._fetchItemsFromCache();

    // trigger prefetch after ui loading animation finishes
    setTimeout(() => {
      this._prefetchNextPage();
    }, 0);
  }

  /**
   * Store results from API in memory
   */
  _addItemsToCache(items) {
    const { cachedItems } = this.get();
    cachedItems[this.startIndex] = items;
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
  async _fetchItemsFromApi(prefetch = false) {
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
      this.set({ error: false, totalItems });
      this._addItemsToCache(items);
    } catch (err) {
      if (!prefetch) {
        // only display error if search is performed as a user request
        this.set({ error: true, items: [], totalItems: 0 });
      }
    }
  }

  /**
   * Return previously-fetched items from in-memory cache
   */
  _fetchItemsFromCache() {
    const items = this.cachedItems[this.startIndex];
    this.set({ items });
  }

  /**
   * Load the next page of results into search cache
   */
  async _prefetchNextPage() {
    if (!this.nextPageIsCached) {
      const { currentPage, itemsPerRequest } = this.get();
      this._setStartIndex(currentPage + 1, itemsPerRequest);
      const { startIndex } = this.get();
      await this._fetchItemsFromApi(true);
      const { cachedItems } = this.get();

      // if no items are returned, set the currentValue's last page as the current page
      if (Array.isArray(cachedItems[startIndex]) && cachedItems[startIndex].length === 0) {
        this.dispatch('lastPageEncountered', currentPage);
      }
    }
  }
}

// export compute functions for tests
module.exports = {
  ItemsModule,
  requestUrl,
  encodedSearchString,
};
