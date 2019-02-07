const { StoreModule } = require('../StoreModule');

const moduleState = {
  // display welcome text; only visible on first load
  firstLoad: true,
  loading: false,
  error: false,

  // controls display of total page count at bottom of ui
  displayTotalPages: false,
};

class UiStatusModule extends StoreModule {
  oncreate(document) {
    this._document = document;
    return moduleState;
  }

  reset() {
    this.set({ loading: false, error: false, firstLoad: true });
  }

  /**
   * Toggle loading on; turn off other UI States
   */
  startLoading() {
    this.set({ loading: true, error: false, firstLoad: false });
  }

  /**
   * Toggle loading off; set error if items request failed
   */
  stopLoading({ itemsState: { error } }) {
    this._document.documentElement.scrollTop = 0;
    this.set({ loading: false, error });
  }

  /**
   * Toggle visibility of total page count in pagination interface
   */
  toggleTotalPagesDisplay() {
    this.displayTotalPages = !this.displayTotalPages;
  }
}

module.exports = { UiStatusModule };
