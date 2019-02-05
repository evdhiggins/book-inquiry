const { StoreModule } = require('../StoreModule');

const moduleState = {
  // display welcome text; only visible on first load
  firstLoad: true,
  loading: false,
  error: false,
};

class UiStatusModule extends StoreModule {
  oncreate() {
    return moduleState;
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
    this.set({ loading: false, error });
  }
}

module.exports = { UiStatusModule };
