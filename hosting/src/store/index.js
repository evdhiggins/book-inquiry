import StoreRoot from './StoreRoot';
import { ItemsModule } from './modules/Items';
import { PaginationModule } from './modules/Pagination';
import { PokeModule } from './modules/Poke';
import { computedFunctions } from './computed';

class Store extends StoreRoot {
  async newSearch() {
    const { searchValue } = this.get();
    if (searchValue.trim() !== '') {
      await this.performSearch();

      // reset pagination state to the first page with the new totalItems #
      const storeState = this.get();
      const { paginationState } = this.dispatch('pagination/reset', storeState);
      this.set({ paginationState });
    } else if (searchValue !== '') {
      this.set({ items: [], lastSearch: searchValue, firstLoad: false });
    }
  }

  async performSearch() {
    this.set({ loading: true, error: false });
    const storeState = this.get();
    const response = await this.dispatch('items/getItems', storeState);
    this.set({
      ...response,
      lastSearch: storeState.searchValue,
      loading: false,
      firstLoad: false,
    });
  }
}

const initialState = {
  error: false,
  firstLoad: true,
  itemsPerRequest: 20,
  items: [],
  lastSearch: '',
  loading: false,
  searchValue: '',
  totalItems: 0,
};

const store = new Store(initialState);

// add all store modules
store.addModule('items', ItemsModule, fetch);
store.addModule('pagination', PaginationModule);
store.addModule('poke', PokeModule, fetch);

// perform search after pagination event occurs
store.addDispatchTrigger('pagination/nextPage', 'performSearch');
store.addDispatchTrigger('pagination/previousPage', 'performSearch');

// add all computed values defined in ./computed.js
computedFunctions.forEach((computeArgs) => {
  store.compute(...computeArgs);
});

export default store;
