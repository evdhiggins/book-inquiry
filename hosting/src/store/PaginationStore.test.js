const { PaginationStore } = require('./PaginationStore');
const { storeFunctions } = require('./__mocks__/index');

const mockInitialState = {
  itemsPerRequest: 20,
  totalItems: 100,
};

describe('_nextPageExists', () => {
  const nextPageExistsWith = (itemsPerRequest, totalItems, currentPage) => {
    const paginationStore = new PaginationStore(storeFunctions);
    paginationStore.reset({ itemsPerRequest, totalItems });
    paginationStore._currentPage = currentPage;
    return paginationStore._nextPageExists();
  };

  test('Return `true` when next page is available', () => {
    expect(nextPageExistsWith(5, 100, 15)).toBe(true);
    expect(nextPageExistsWith(5, 100, 19)).toBe(true);
  });

  test('Return `false` when next page is not available', () => {
    expect(nextPageExistsWith(5, 100, 20)).toBe(false);
    expect(nextPageExistsWith(5, 100, 100)).toBe(false);
  });
});

describe('_previousPageExists', () => {
  const previousPageExistsWith = (currentPage) => {
    const paginationStore = new PaginationStore(storeFunctions);
    paginationStore._currentPage = currentPage;
    return paginationStore._previousPageExists();
  };

  test('Return `true` when previous page is available', () => {
    expect(previousPageExistsWith(2)).toBe(true);
    expect(previousPageExistsWith(10)).toBe(true);
  });

  test('Return `false` when previous page is not available', () => {
    expect(previousPageExistsWith(1)).toBe(false);
    expect(previousPageExistsWith(-10)).toBe(false);
  });
});

describe('reset', () => {
  test('Set currentPage to 1', () => {
    const paginationStore = new PaginationStore(storeFunctions);
    paginationStore._currentPage = 5;
    const { currentPage } = paginationStore.reset(mockInitialState).paginationState;
    expect(currentPage).toBe(1);
  });

  test('Set `itemsPerRequest` and `totalItems` to match input state', () => {
    const paginationStore = new PaginationStore(storeFunctions);
    paginationStore.reset({ itemsPerRequest: 10, totalItems: 50 });
    expect(paginationStore._itemsPerRequest).toBe(10);
    expect(paginationStore._totalItems).toBe(50);
  });

  test('Calculate and set `totalPages` based on `itemsPerRequest` and `totalItems`', () => {
    const paginationStore = new PaginationStore(storeFunctions);
    paginationStore.reset({ itemsPerRequest: 10, totalItems: 100 });
    expect(paginationStore._totalPages).toBe(10);
    paginationStore.reset({ itemsPerRequest: 10, totalItems: 15 });
    expect(paginationStore._totalPages).toBe(2);
  });

  test('Set `itemsPerRequest` & `totalItems` to 1 & 0 if input values are not valid numbers', () => {
    const paginationStore = new PaginationStore(storeFunctions);
    paginationStore.reset({ itemsPerRequest: 0, totalItems: -23 });
    expect(paginationStore._itemsPerRequest).toBe(1);
    expect(paginationStore._totalItems).toBe(0);
    paginationStore.reset({});
    expect(paginationStore._itemsPerRequest).toBe(1);
    expect(paginationStore._totalItems).toBe(0);
  });
});

describe('nextPage', () => {
  test('Increment `currentPage` by one if next page exists', () => {
    const paginationStore = new PaginationStore(storeFunctions);
    paginationStore.reset({ itemsPerRequest: 5, totalItems: 50 });
    const initialPage = paginationStore._currentPage;
    const { currentPage } = paginationStore.nextPage().paginationState;
    expect(currentPage).toBe(initialPage + 1);
  });

  test("Don't modify `currentPage` if next page doesn't exist", () => {
    const paginationStore = new PaginationStore(storeFunctions);
    paginationStore._currentPage = 5;
    const { currentPage } = paginationStore.nextPage().paginationState;
    expect(currentPage).toBe(5);
  });
});

describe('previousPage', () => {
  test('Decrement `currentPage` by one if previous page exists', () => {
    const paginationStore = new PaginationStore(storeFunctions);
    paginationStore._currentPage = 5;
    const { currentPage } = paginationStore.previousPage().paginationState;
    expect(currentPage).toBe(4);
  });

  test("Don't modify `currentPage` if previous page doesn't exist", () => {
    const paginationStore = new PaginationStore(storeFunctions);
    expect(paginationStore._currentPage).toBe(1);
    const { currentPage } = paginationStore.previousPage().paginationState;
    expect(currentPage).toBe(1);
  });
});
