import { Store } from 'svelte/store';
import { ItemStore } from './ItemStore';
import { computedFunctions } from './computed';

// ENVIRONMENT is replaced with 'dev' / 'prod' on serve / build
// eslint-disable-next-line no-constant-condition
const baseUrl = 'ENVIRONMENT' === 'dev'
  ? 'http://localhost:5000/book-inquiry/us-central1/api/'
  : 'https://us-central1-book-inquiry.cloudfunctions.net/api/';

class SearchStore extends Store {
  constructor(storeState, { itemStore }) {
    super(storeState);
    this._itemStore = itemStore;
  }

  nextPage() {
    const { currentPage, nextPageExists } = this.get();
    if (nextPageExists) {
      this.set({ currentPage: currentPage + 1 });
      this.performSearch();
    }
  }

  previousPage() {
    const { currentPage, previousPageExists } = this.get();
    if (previousPageExists) {
      this.set({ currentPage: currentPage - 1 });
      this.performSearch();
    }
  }

  newSearch() {
    const { searchValue } = this.get();
    if (searchValue.trim() !== '') {
      this.resetState();
      this.performSearch();
    }
    if (searchValue !== '') {
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

  resetState() {
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
  currentPage: 1,
  error: false,
  firstLoad: true,
  itemsPerRequest: 20,
  items: [],
  lastSearch: '',
  loading: false,
  searchValue: '',
  totalItems: 0,
};

const itemStore = new ItemStore(fetch);

const store = new SearchStore(initialState, { itemStore });

// add all computed values defined in ./computed.js
computedFunctions.forEach((computeArgs) => {
  store.compute(...computeArgs);
});

export default store;
