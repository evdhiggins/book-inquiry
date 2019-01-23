import { Store } from 'svelte/store';
import { computedFunctions } from './computed';

// ENVIRONMENT is replaced with 'dev' / 'prod' on serve / build
// eslint-disable-next-line no-constant-condition
const baseUrl = 'ENVIRONMENT' === 'dev'
  ? 'http://localhost:5000/book-inquiry/us-central1/api/'
  : 'https://us-central1-book-inquiry.cloudfunctions.net/api/';

class SearchStore extends Store {
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
    this.resetState();
    this.performSearch();
  }

  async performSearch() {
    this.set({ loading: true });
    const { searchValue, currentIndex } = this.get();
    try {
      const encodedSearchString = encodeURI(searchValue);
      const requestUrl = `${baseUrl}search?q=${encodedSearchString}&startIndex=${currentIndex}`;
      const response = await fetch(requestUrl);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const { items, totalItems } = await response.json();
      this.set({ items, totalItems });
    } catch (err) {
      this.resetState();
      alert(err);
    }
    this.set({ loading: false });
  }

  resetState() {
    this.set({ items: [], totalItems: 0, currentPage: 1 });
  }
}

const store = new SearchStore({
  currentPage: 1,
  itemsPerRequest: 5,
  items: [],
  loading: false,
  searchValue: '',
  totalItems: 0,
});

// add all computed values defined in ./computed.js
computedFunctions.forEach((computeArgs) => {
  store.compute(...computeArgs);
});

export default store;
