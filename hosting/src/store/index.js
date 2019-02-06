import StoreRoot from './StoreRoot';
import { ItemsModule } from './modules/Items';
import { HistoryModule } from './modules/History';
import { PaginationModule } from './modules/Pagination';
import { PingModule } from './modules/Ping';
import { UiStatusModule } from './modules/UiStatus';

class Store extends StoreRoot {
  /**
   * Triggered by the search button or an "enter" keyup event in the search bar
   */
  async search() {
    const { searchValue } = this.get();
    if (searchValue.trim() !== '') {
      this.dispatch('ui/startLoading');
      this.dispatch('setLastSearchValue');
      this.dispatch('pagination/reset', this.get());
      this.dispatch('items/clearCache');
      await this.dispatch('items/getItems', this.get());
      this.dispatch('pagination/updateItemCounts', this.get());
      this.dispatch('history/pushState', this.get());
      this.dispatch('ui/stopLoading', this.get());
    }
  }

  /**
   * Triggered by browser back/forward events when there is no previous search
   * information in navigation state or the URL query params
   */
  clearState() {
    this.set({ searchValue: '' });
    this.dispatch('ui/reset');
  }

  /**
   * Triggered by browser back/forward events, or by opening the application
   * directly to a search url
   */
  async navigationChange({ currentPage, searchValue }) {
    this.dispatch('ui/startLoading');
    this.set({ searchValue });
    this.dispatch('pagination/setPage', currentPage);
    this.dispatch('setLastSearchValue');
    await this.dispatch('items/getItems', this.get());
    this.dispatch('pagination/updateItemCounts', this.get());
    this.dispatch('ui/stopLoading', this.get());
  }

  /**
   * Triggered by the "next page" pagination button
   */
  async nextPage() {
    this.dispatch('ui/startLoading');
    this.dispatch('pagination/nextPage');
    this.dispatch('setLastSearchValue');
    await this.dispatch('items/getItems', this.get());
    this.dispatch('pagination/updateItemCounts', this.get());
    this.dispatch('history/pushState', this.get());
    this.dispatch('ui/stopLoading', this.get());
  }

  /**
   * Triggered by the "previous page" pagination button
   */
  async previousPage() {
    this.dispatch('ui/startLoading');
    this.dispatch('pagination/previousPage');
    this.dispatch('setLastSearchValue');
    await this.dispatch('items/getItems', this.get());
    this.dispatch('pagination/updateItemCounts', this.get());
    this.dispatch('history/pushState', this.get());
    this.dispatch('ui/stopLoading', this.get());
  }

  /**
   * Save the previous search. Displayed in the case where no items are found
   */
  setLastSearchValue() {
    const { searchValue } = this.get();
    this.set({ lastSearchValue: searchValue });
  }
}

const initialState = {
  itemsPerRequest: 20,
  lastSearchValue: '',
  searchValue: '',
};

const store = new Store(initialState);

// add all store modules
store.addModule('items', ItemsModule, fetch);
store.addModule('history', HistoryModule, { window, history: window.history });
store.addModule('pagination', PaginationModule);
store.addModule('ping', PingModule, fetch);
store.addModule('ui', UiStatusModule, document);

export default store;
