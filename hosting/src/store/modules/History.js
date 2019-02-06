const { StoreModule } = require('../StoreModule');

/**
 * Construct a query url from the current `queryParams`
 */
const pageUrl = ({ queryParams }) => `?${Object.entries(queryParams)
  .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  .join('&')}`;

/**
 * Create query object from page state with variables used in query url
 */
const queryParams = ({ pageState }) => ({
  q: pageState.searchValue || '',
  page: Number(pageState.currentPage) || 1,
});

const moduleState = {
  pageState: {
    currentPage: 1,
    searchValue: '',
  },
  queryParams,
  pageUrl,
};

class HistoryModule extends StoreModule {
  oncreate({ window, history }) {
    // set module state first, as it is used in the oncreate function
    this.set(moduleState);

    this._window = window;
    this._history = history;

    // call `_popstate` on window onpopstate event
    this._window.onpopstate = this._popState.bind(this);

    // check initial url to see if application was opened directly into a search
    const queryUrl = this._window.location.search;
    this._extractQueryParams(queryUrl);

    if (this.pageState.searchValue !== '') {
      setTimeout(() => this.dispatch('navigationChange', this.pageState), 0);
    }
  }

  /**
   * Change to previous state. Triggered by browser back/forward actions
   */
  _popState(navigationEvent) {
    if (navigationEvent.state === null) {
      const queryUrl = this._window.location.search;
      this._extractQueryParams(queryUrl);
      if (!this.pageState.searchValue) {
        return this.dispatch('clearState');
      }
    } else {
      this.pageState = navigationEvent.state;
    }
    return this.dispatch('navigationChange', this.pageState);
  }

  /**
   * Push current state to browser history, updating url
   */
  pushState(rootState) {
    this._updatePageState(rootState);
    this._history.pushState(this.pageState, 'Book Inquiry', this.pageUrl);
  }

  /**
   * Extract query parameters from URL. Called when application is first loaded and when
   * no stored state is found in `navigationEvent`
   */
  _extractQueryParams(queryUrl = '') {
    // exclude "?" from param string
    const paramString = queryUrl.substring(1);
    const params = paramString.split('&').reduce((acc, paramSet) => {
      const [key, value] = paramSet.split('=', 2);
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
    this.pageState = {
      currentPage:
        !Number.isNaN(Number(params.page)) && Number(params.page) > 0 ? Number(params.page) : 1,
      searchValue: params.q || '',
    };
  }

  /**
   * Update the History module's account of page state from the StoreRoot state
   */
  _updatePageState({ paginationState, searchValue }) {
    this.pageState = {
      searchValue,
      currentPage: paginationState.currentPage,
    };
  }
}

module.exports = { HistoryModule, pageUrl, queryParams };
