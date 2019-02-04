const storeFunctionsFactory = () => ({
  state: {},
  rootState: {},
  getter() {
    return this.state;
  },
  setter(state) {
    this.state = state;
  },
  rootGetter() {
    return this.rootState;
  },
});

const storeFunctions = storeFunctionsFactory();

module.exports = { storeFunctions, storeFunctionsFactory };
