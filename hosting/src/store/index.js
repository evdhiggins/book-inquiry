import { Store } from 'svelte/store';

class SearchStore extends Store {
  async performSearch(searchValue) {
    try {
      const encodedSearchString = encodeURI(searchValue);
      const requestUrl = `http://localhost:5000/book-inquiry/us-central1/api/search?q=${encodedSearchString}`;
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
