class StoreModule {
  constructor(storeFunctions) {
    this.get = storeFunctions.getter;
    this.set = storeFunctions.setter;
    this.rootGet = storeFunctions.rootGetter;
    this.dispatch = storeFunctions.dispatch;
  }
}

module.exports = { StoreModule };
