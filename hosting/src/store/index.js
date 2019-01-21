import { Store } from 'svelte/store';

// ENVIRONMENT is replaced with 'dev' / 'prod' on serve / build
// eslint-disable-next-line no-constant-condition
const baseUrl = 'ENVIRONMENT' === 'dev'
  ? 'http://localhost:5000/book-inquiry/us-central1/api/'
  : 'https://us-central1-book-inquiry.cloudfunctions.net/api/';

class SearchStore extends Store {
  async performSearch(searchValue) {
    try {
      const encodedSearchString = encodeURI(searchValue);
      const requestUrl = `${baseUrl}search?q=${encodedSearchString}`;
      const response = await fetch(requestUrl);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const { items } = await response.json();
      this.set({ items });
    } catch (err) {
      alert(err);
    }
  }
}

const store = new SearchStore({
  items: [],
});

export default store;
