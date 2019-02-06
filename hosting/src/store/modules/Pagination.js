/**
 * `PaginationModule` controls the logic and state of pagination
 * in the application
 */

const { StoreModule } = require('../StoreModule');

const nextPageExists = ({ currentPage, totalPages }) => currentPage < totalPages;
const previousPageExists = ({ currentPage }) => currentPage > 1;
const totalPages = ({ totalItems, itemsPerRequest }) => Math.ceil(totalItems / itemsPerRequest);

const moduleState = {
  currentPage: 1,
  itemsPerRequest: 1,
  totalItems: 0,

  // computed state
  totalPages,
  nextPageExists,
  previousPageExists,
};

class PaginationModule extends StoreModule {
  oncreate() {
    return moduleState;
  }

  /**
   * Reset the `PaginationModule` state to values calculated from `storeState`
   * @param {any} storeState The state object of the UI store
   */
  reset(rootState) {
    this.currentPage = 1;
    this.updateItemCounts(rootState);
    return this;
  }

  /**
   * Increment `currentPage` by one
   */
  nextPage() {
    if (this.nextPageExists) {
      this.currentPage += 1;
    }
    return this;
  }

  /**
   * Decrement `currentPage` by one
   */
  previousPage() {
    if (this.previousPageExists) {
      this.currentPage -= 1;
    }
    return this;
  }

  /**
   * Manually set currentPage. If the value is out of page bounds, the closest value is chosen
   */
  setPage(newPage) {
    this.currentPage = newPage;
  }

  updateItemCounts({ itemsPerRequest = 1, itemsState: { totalItems = 0 } }) {
    this.itemsPerRequest = Number(itemsPerRequest) > 0 ? Number(itemsPerRequest) : 1;
    this.totalItems = Number(totalItems) > 0 ? Number(totalItems) : 0;
  }
}

// export compute functions for tests
module.exports = {
  PaginationModule,
  nextPageExists,
  previousPageExists,
  totalPages,
};
