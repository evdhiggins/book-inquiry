const {
  PaginationModule,
  nextPageExists,
  previousPageExists,
  totalPages,
} = require('./Pagination');
const { storeFunctions } = require('../__mocks__/index');

const mockInitialState = {
  itemsPerRequest: 20,
  totalItems: 100,
};

describe('nextPageExists', () => {
  test('Return `true` when next page is available', () => {
    expect(nextPageExists({ currentPage: 19, totalPages: 20 })).toBe(true);
  });

  test('Return `false` when next page is not available', () => {
    expect(nextPageExists({ currentPage: 20, totalPages: 20 })).toBe(false);
  });
});

describe('_previousPageExists', () => {
  test('Return `true` when previous page is available', () => {
    expect(previousPageExists({ currentPage: 2 })).toBe(true);
  });

  test('Return `false` when previous page is not available', () => {
    expect(previousPageExists({ currentPage: 1 })).toBe(false);
  });
});

describe('totalPages', () => {
  test('Return the total number of pages based on `itemsPerRequest` and `totalItems`', () => {
    expect(totalPages({ itemsPerRequest: 10, totalItems: 100 })).toBe(10);
    expect(totalPages({ itemsPerRequest: 10, totalItems: 15 })).toBe(2);
  });
});

describe('reset', () => {
  test('Set currentPage to 1', () => {
    const paginationStore = new PaginationModule(storeFunctions);
    paginationStore.currentPage = 5;
    paginationStore.reset(mockInitialState);
    expect(paginationStore.currentPage).toBe(1);
  });

  test('Set `itemsPerRequest` and `totalItems` to match input state', () => {
    const paginationStore = new PaginationModule(storeFunctions);
    paginationStore.reset({ itemsPerRequest: 10, totalItems: 50 });
    expect(paginationStore.itemsPerRequest).toBe(10);
    expect(paginationStore.totalItems).toBe(50);
  });

  test('Set `itemsPerRequest` & `totalItems` to 1 & 0 if input values are not valid numbers', () => {
    const paginationStore = new PaginationModule(storeFunctions);
    paginationStore.reset({ itemsPerRequest: 0, totalItems: -23 });
    expect(paginationStore.itemsPerRequest).toBe(1);
    expect(paginationStore.totalItems).toBe(0);
  });
});

describe('nextPage', () => {
  test('Increment `currentPage` by one if next page exists', () => {
    const paginationStore = new PaginationModule(storeFunctions);
    paginationStore.reset({ itemsPerRequest: 5, totalItems: 50 });
    const initialPage = paginationStore.currentPage;
    paginationStore.nextPage();
    expect(paginationStore.currentPage).toBe(initialPage + 1);
  });

  test("Don't modify `currentPage` if next page doesn't exist", () => {
    const paginationStore = new PaginationModule(storeFunctions);
    paginationStore.currentPage = 5;
    paginationStore.nextPage();
    expect(paginationStore.currentPage).toBe(5);
  });
});

describe('previousPage', () => {
  test('Decrement `currentPage` by one if previous page exists', () => {
    const paginationStore = new PaginationModule(storeFunctions);
    paginationStore.currentPage = 5;
    paginationStore.previousPage();
    expect(paginationStore.currentPage).toBe(4);
  });

  test("Don't modify `currentPage` if previous page doesn't exist", () => {
    const paginationStore = new PaginationModule(storeFunctions);
    expect(paginationStore.currentPage).toBe(1);
    paginationStore.previousPage();
    expect(paginationStore.currentPage).toBe(1);
  });
});
