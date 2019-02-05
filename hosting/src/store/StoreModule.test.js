const { StoreModule } = require('./StoreModule');
const { storeFunctionsFactory } = require('./__mocks__/index');

const totalCountPlusOne = jest.fn(({ totalCount }) => totalCount + 1);

describe('__addStateProp', () => {
  test('Add a prop to `__state`', () => {
    const store = new StoreModule(storeFunctionsFactory());
    store.__addStateProp('totalCount', 10);
    expect(store.__state).toHaveProperty('totalCount');
    expect(store.__state.totalCount).toBe(10);
  });

  test("Add a prop as a StoreModule's root property", () => {
    const store = new StoreModule(storeFunctionsFactory());
    store.__addStateProp('totalCount', 10);
    expect(store).toHaveProperty('totalCount');
    expect(store.totalCount).toBe(10);
  });

  test('Update StoreModule.__state[prop] when StoreModule[prop] is updated', () => {
    const store = new StoreModule(storeFunctionsFactory());
    store.__addStateProp('totalCount', 50);
    expect(store.totalCount).toBe(50);
    expect(store.__state.totalCount).toBe(50);
    store.totalCount = 0;
    expect(store.totalCount).toBe(0);
    expect(store.__state.totalCount).toBe(0);
  });

  test("Update module's StoreRoot state when StoreModule[prop] is updated", () => {
    const storeFunctions = storeFunctionsFactory();
    const store = new StoreModule(storeFunctions);
    store.__addStateProp('totalCount', 20);
    expect(storeFunctions.state.totalCount).toBe(20);
    store.totalCount = -50;
    expect(storeFunctions.state.totalCount).toBe(-50);
  });

  test('Add a compute state func to __computed', () => {
    const store = new StoreModule(storeFunctionsFactory());
    store.__addStateProp('totalCountPlusOne', totalCountPlusOne);
    expect(store.__computed).toHaveProperty('totalCountPlusOne');
    expect(store.__computed.totalCountPlusOne).toBe(totalCountPlusOne);
  });

  test('Add compute state func to __state with an initial value of `null`', () => {
    const store = new StoreModule(storeFunctionsFactory());
    store.__addStateProp('totalCountPlusOne', totalCountPlusOne, true);
    expect(store.__state).toHaveProperty('totalCountPlusOne');
    expect(store.__state.totalCountPlusOne).toBe(null);
  });

  test('Add compute state prop as StoreModule root property', () => {
    const storeFunctions = storeFunctionsFactory();
    const store = new StoreModule(storeFunctions);
    store.__addStateProp('totalCountPlusOne', totalCountPlusOne);
    expect(storeFunctions.state).toHaveProperty('totalCountPlusOne');
  });

  test('Evaluate compute prop values from the return value of compute functions', () => {
    const store = new StoreModule(storeFunctionsFactory());
    store.__addStateProp('totalCount', 10);
    store.__addStateProp('totalCountPlusOne', totalCountPlusOne);
    expect(store.totalCountPlusOne).toBe(11);
  });

  test('Re-evaluated compute function each time that the StoreModule state changes', () => {
    const computeFunc = jest.fn(totalCountPlusOne);
    const store = new StoreModule(storeFunctionsFactory());
    store.__addStateProp('totalCount', 0);
    store.__addStateProp('totalCountPlusOne', computeFunc);
    expect(computeFunc.mock.calls.length).toBe(1);
    store.totalCount = 100;
    store.totalCount = 500;
    expect(computeFunc.mock.calls.length).toBe(3);
  });
});

describe('__createInitialState', () => {
  const store = new StoreModule(storeFunctionsFactory());
  const intitialState = {
    itemsPerPage: 10,
    totalPages: 5,
    totalItems: ({ itemsPerPage, totalPages }) => itemsPerPage * totalPages,
  };
  store.__createInitialState(intitialState);

  test('Add an object of state props & functions as StoreModule root properties', () => {
    expect(store.itemsPerPage).toBe(10);
    expect(store.totalPages).toBe(5);
    expect(store.totalItems).toBe(50);
  });

  test('Add any functions in initialState to __computed', () => {
    expect(store.__computed).not.toHaveProperty('totalPages');
    expect(store.__computed).toHaveProperty('totalItems');
  });
});
