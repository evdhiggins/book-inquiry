const storeFunctionsFactory = () => {
  const storeFunctions = {
    state: {},
    rootState: {},
    dispatch: jest.fn(),
  };
  function setter(state) {
    this.state = state;
  }
  function rootGetter() {
    return this.rootState;
  }
  storeFunctions.setter = setter.bind(storeFunctions);
  storeFunctions.rootGetter = rootGetter.bind(storeFunctions);
  return storeFunctions;
};

// eslint-disable-next-line no-unused-vars
const fetchMockFactory = (httpError = false, serverError = false) => jest.fn(async url => ({
  ok: !httpError,
  json: async () => ({
    error: serverError,
    totalItems: 0,
    items: [],
  }),
}));

const windowMockFactory = (queryString = '') => ({
  location: {
    search: queryString,
  },
});

const historyMockFactory = () => {
  const history = {
    state: [],
  };
  function pushState(state, title, url) {
    this.state.push({ state, title, url });
  }
  history.pushState = jest.fn(pushState.bind(history));
  return history;
};

const storeFunctions = storeFunctionsFactory();
const windowMock = windowMockFactory();

module.exports = {
  storeFunctions,
  fetchMockFactory,
  storeFunctionsFactory,
  historyMockFactory,
  windowMock,
  windowMockFactory,
};
