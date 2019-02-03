class PaginationStore {
  /**
   * The current state of `PaginationStore`
   */
  get paginationState() {
    return {
      currentPage: this._currentPage,
      nextPageExists: this._nextPageExists(),
      previousPageExists: this._previousPageExists(),
    };
  }

  /**
   * `PaginationStore` controls the logic and state of pagination
   * in the application
   * @param {any} storeState The state object of the UI store
   */
  constructor(storeState) {
    this.reset(storeState);
  }

  /**
   * Reset the `PaginationStore` state to values calculated from `storeState`
   * @param {any} storeState The state object of the UI store
   */
  reset({ itemsPerRequest = 1, totalItems = 0 }) {
    this._currentPage = 1;
    this._itemsPerRequest = Number(itemsPerRequest) > 0 ? Number(itemsPerRequest) : 1;
    this._totalItems = Number(totalItems) > 0 ? Number(totalItems) : 0;
    this._totalPages = Math.ceil(this._totalItems / this._itemsPerRequest);
    return this;
  }

  /**
   * Increment `currentPage` by one
   */
  nextPage() {
    if (this._nextPageExists()) {
      this._currentPage += 1;
    }
    return this;
  }

  /**
   * Decrement `currentPage` by one
   */
  previousPage() {
    if (this._previousPageExists()) {
      this._currentPage -= 1;
    }
    return this;
  }

  _nextPageExists() {
    return this._currentPage < this._totalPages;
  }

  _previousPageExists() {
    return this._currentPage > 1;
  }
}

module.exports = { PaginationStore };