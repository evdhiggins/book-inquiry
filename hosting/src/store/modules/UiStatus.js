const { StoreModule } = require('../StoreModule');

const moduleState = {
  // display welcome text; only visible on first load
  firstLoad: true,
  loading: false,
  error: false,
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
}

module.exports = { UiStatusModule };
