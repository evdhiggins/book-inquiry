import StoreRoot from './StoreRoot';
import { ItemsModule } from './modules/Items';
import { PaginationModule } from './modules/Pagination';
import { PingModule } from './modules/Ping';
import { UiStatusModule } from './modules/UiStatus';

class Store extends StoreRoot {
  async newSearch() {
    const { searchValue } = this.get();
    if (searchValue.trim() !== '') {
      await this.dispatch('performSearch');
      this.dispatch('pagination/reset', this.get());
    }
  }

  async performSearch() {
    this.dispatch('ui/startLoading');
    const { searchValue } = this.get();
    this.set({ lastSearch: searchValue });
    await this.dispatch('items/getItems', this.get());
    this.dispatch('ui/stopLoading', this.get());
  }

  nextPage() {
    this.dispatch('pagination/nextPage');
    this.dispatch('performSearch');
  }

  previousPage() {
    this.dispatch('pagination/previousPage');
    this.dispatch('performSearch');
  }
}

const initialState = {
  itemsPerRequest: 20,
  lastSearch: '',
  searchValue: '',
};

const store = new Store(initialState);

// add all store modules
store.addModule('items', ItemsModule, fetch);
store.addModule('pagination', PaginationModule);
store.addModule('ping', PingModule, fetch);
store.addModule('ui', UiStatusModule, fetch);

export default store;
