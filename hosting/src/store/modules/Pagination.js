/**
 * `PaginationModule` controls the logic and state of pagination
 * in the application
 */

const { StoreModule } = require('../StoreModule');

const nextPageExists = ({ currentPage, totalPages }) => currentPage < totalPages;
const previousPageExists = ({ currentPage }) => currentPage > 1;

/**
 * Calculate the total number of pages available
 */
const totalPages = ({
  currentPage, totalItems, itemsPerRequest, lastPage = 0,
}) => {
  // default to lastPage if set
  if (lastPage !== 0) {
    return lastPage;
  }
  // after each api request totalItems is updated with the API's estimation of the remaining
  // number of items from the current start index (not the total items overall)
  const remainingPages = Math.ceil(totalItems / itemsPerRequest) - 1;
  return currentPage + remainingPages;
};

const moduleState = {
  currentPage: 1,
  itemsPerRequest: 1,
  totalItems: 0,
  lastPage: 0,

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
    this.set({ currentPage: 1, lastPage: 0 });
    this.updateItemCounts(rootState);
    return this;
  }

  /**
   * Triggered by items/prefetch when a request returns no items. Sets a hard limit
   * on the current number of pages, instead of relying on an estimate calculated from
   * the returned `totalItems` value
   */
  setLastPage(lastPage) {
    this.set({ lastPage });
  }

  /**
   * Increment `currentPage` by one
   */
  nextPage() {
    if (this.nextPageExists) {
      this.set({ currentPage: this.currentPage + 1 });
    }
  }

  /**
   * Decrement `currentPage` by one
   */
  previousPage() {
    if (this.previousPageExists) {
      this.set({ currentPage: this.currentPage - 1 });
    }
  }

  /**
   * Manually set currentPage. If the value is out of page bounds, the closest value is chosen
   */
  setPage(newPage) {
    this.set({ currentPage: newPage });
  }

  updateItemCounts({ itemsPerRequest = 1, itemsState: { totalItems = 0 } }) {
    this.set({
      itemsPerRequest: Number(itemsPerRequest) > 0 ? Number(itemsPerRequest) : 1,
      totalItems: Number(totalItems) > 0 ? Number(totalItems) : 0,
    });
  }
}

// export compute functions for tests
module.exports = {
  PaginationModule,
  nextPageExists,
  previousPageExists,
  totalPages,
};
