const { HistoryModule, pageUrl, queryParams } = require('./History');
const {
  storeFunctionsFactory,
  windowMock,
  historyMockFactory,
  windowMockFactory,
} = require('../__mocks__/index');

describe('pageUrl', () => {
  test('Return a URL query string containing all input keys', () => {
    const queryString = pageUrl({ queryParams: { q: 'a bit of text', pages: 5 } });
    expect(queryString).toMatch(/q=/);
    expect(queryString).toMatch(/pages=/);
  });

  test('Properly encode query string values', () => {
    const queryString1 = pageUrl({ queryParams: { q: 'a bit of text' } });
    const queryString2 = pageUrl({ queryParams: { q: 'Sürətli külək' } });
    expect(queryString1).toMatch(/q=a%20bit%20of%20text/);
    expect(queryString2).toMatch(/q=S%C3%BCr%C9%99tli%20k%C3%BCl%C9%99k/);
  });
});

describe('queryParams', () => {
  test('Convert page state variables to url query variables', () => {
    const params = queryParams({ pageState: { searchValue: 'searchValue', currentPage: 3 } });
    expect(params.q).toBe('searchValue');
    expect(params.page).toBe(3);
  });
});

describe('_extractQueryParams', () => {
  const window = windowMock;
  const history = historyMockFactory();
  const historyModule = new HistoryModule(storeFunctionsFactory(), { window, history });

  test('Set pageState values from values in url query string', () => {
    historyModule._extractQueryParams('?q=a%20search&page=67');
    expect(historyModule.pageState.searchValue).toBe('a search');
    expect(historyModule.pageState.currentPage).toBe(67);
  });

  test('Set pageState to default values if query string values are missing / invalid', () => {
    historyModule._extractQueryParams();
    expect(historyModule.pageState.searchValue).toBe('');
    expect(historyModule.pageState.currentPage).toBe(1);
  });
});

describe('pushState', () => {
  const window = windowMock;
  const history = historyMockFactory();
  const historyModule = new HistoryModule(storeFunctionsFactory(), { window, history });
  historyModule.pushState({ paginationState: { currentPage: 5 }, searchValue: 'text' });

  test('Update pageState values', () => {
    expect(historyModule.pageState.searchValue).toBe('text');
    expect(historyModule.pageState.currentPage).toBe(5);
  });

  test('Call `history.pushState` once', () => {
    expect(history.pushState.mock.calls.length).toBe(1);
  });
});

describe('_popState', () => {
  const window = windowMock;
  const history = historyMockFactory();

  test('Dispatch "clearState" when there is no query string in url or navigation state in event', () => {
    const storeFunctions = storeFunctionsFactory();
    const historyModule = new HistoryModule(storeFunctions, { window, history });
    historyModule._popState({ state: null });
    const dispatchCommand = storeFunctions.dispatch.mock.calls[0][0];
    expect(dispatchCommand).toBe('clearState');
  });

  describe('When no navigation state exists in event but query string exists', () => {
    const storeFunctions = storeFunctionsFactory();
    const queryString = '?q=searchtext&page=7';
    const historyModule = new HistoryModule(storeFunctions, {
      window: windowMockFactory(queryString),
      history,
    });
    historyModule._popState({ state: null });
    const [dispatchCommand, dispatchArg] = storeFunctions.dispatch.mock.calls[0];

    test('Dispatch "navigationChange"', () => {
      expect(dispatchCommand).toBe('navigationChange');
    });

    test('Pass pageState extracted from queryString in dispatch', () => {
      expect(dispatchArg.currentPage).toBe(7);
      expect(dispatchArg.searchValue).toBe('searchtext');
    });
  });

  describe('When navigation state exists', () => {
    const storeFunctions = storeFunctionsFactory();
    const historyModule = new HistoryModule(storeFunctions, { window, history });
    const navigationEvent = { state: { searchValue: 'in state', currentPage: 18 } };
    historyModule._popState(navigationEvent);
    const [dispatchCommand, dispatchArg] = storeFunctions.dispatch.mock.calls[0];

    test('Dispatch "navigationChange"', () => {
      expect(dispatchCommand).toBe('navigationChange');
    });

    test('Pass pageState from navigation event in dispatch', () => {
      expect(dispatchArg.currentPage).toBe(18);
      expect(dispatchArg.searchValue).toBe('in state');
    });
  });
});
