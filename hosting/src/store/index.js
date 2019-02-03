import { Store } from 'svelte/store';
import { ItemStore } from './ItemStore';
import { PaginationStore } from './PaginationStore';
import { computedFunctions } from './computed';

// ENVIRONMENT is replaced with 'dev' / 'prod' on serve / build
// eslint-disable-next-line no-constant-condition
const baseUrl = 'ENVIRONMENT' === 'dev'
  ? 'http://localhost:5000/book-inquiry/us-central1/api/'
  : 'https://us-central1-book-inquiry.cloudfunctions.net/api/';

class SearchStore extends Store {
  constructor(storeState, { itemStore, paginationStore }) {
    super(storeState);
    this._itemStore = itemStore;
    this._paginationStore = paginationStore;
  }

  nextPage() {
    const { paginationState } = this._paginationStore.nextPage();
    this.set({ paginationState });
    this.performSearch();
  }

  previousPage() {
    const { paginationState } = this._paginationStore.previousPage();
    this.set({ paginationState });
    this.performSearch();
  }

  async newSearch() {
    const { searchValue } = this.get();
    if (searchValue.trim() !== '') {
      this.resetUiState();
      await this.performSearch();

      // reset pagination state to the first page with the new totalItems #
      const storeState = this.get();
      const { paginationState } = this._paginationStore.reset(storeState);
      this.set({ paginationState });
    } else if (searchValue !== '') {
      this.set({ items: [], lastSearch: searchValue, firstLoad: false });
    }
  }

  async performSearch() {
    this.set({ loading: true, error: false });
    const storeState = this.get();
    const response = await this._itemStore.getItems(storeState);
    this.set({
      ...response,
      lastSearch: storeState.searchValue,
      loading: false,
      firstLoad: false,
    });
  }

  resetUiState() {
    this.set({ items: [], totalItems: 0, currentPage: 1 });
  }

  // eslint-disable-next-line class-methods-use-this
  async pokeServer() {
    try {
      await fetch(`${baseUrl}poke`);
    } catch (e) {
      // do nothing if poke call fails
    }
  }
}

const initialState = {
  paginationState: {
    currentPage: 1,
    nextPageExists: false,
    previousPageExists: false,
  },
  error: false,
  firstLoad: true,
  itemsPerRequest: 20,
  items: [],
  lastSearch: '',
  loading: false,
  searchValue: '',
  totalItems: 0,
};

// create sub-stores
const itemStore = new ItemStore(fetch);
const paginationStore = new PaginationStore(initialState);

const store = new SearchStore(initialState, { itemStore, paginationStore });

// add all computed values defined in ./computed.js
computedFunctions.forEach((computeArgs) => {
  store.compute(...computeArgs);
});

export default store;
