const { nextPageExists, currentIndex, previousPageExists } = require('./computed');

describe('currentIndex', () => {
  test('Return the index of the next item', () => {
    expect(currentIndex(1, 5)).toBe(0);
    expect(currentIndex(5, 10)).toBe(40);
  });

  test('Return `0` when either input is NaN or negative', () => {
    expect(currentIndex(NaN, 5)).toBe(0);
    expect(currentIndex(-55, 5)).toBe(0);
    expect(currentIndex(-23, -23)).toBe(0);
    expect(currentIndex(100)).toBe(0);
  });
});

describe('nextPageExists', () => {
  test('Return a boolean', () => {
    expect(typeof nextPageExists(5, 5, 1)).toBe('boolean');
  });

  test('Return true when next page is available', () => {
    expect(nextPageExists(5, 100, 15)).toBe(true);
    expect(nextPageExists(5, 100, 19)).toBe(true);
    expect(nextPageExists(5, 100, 20)).toBe(false);
    expect(nextPageExists(5, 100, 100)).toBe(false);
  });

  test('Return false when given irregular values', () => {
    expect(nextPageExists()).toBe(false);
    expect(nextPageExists(-124, -553, 0)).toBe(false);
    expect(nextPageExists('one', 'two', 'three')).toBe(false);
  });
});

describe('previousPageExists', () => {
  test('Return `false` when input is less than or equal 1', () => {
    expect(previousPageExists(1)).toBe(false);
    expect(previousPageExists(0)).toBe(false);
    expect(previousPageExists(-999)).toBe(false);
  });

  test('Return `false` when input is NaN', () => {
    expect(previousPageExists()).toBe(false);
    expect(previousPageExists(NaN)).toBe(false);
    expect(previousPageExists(null)).toBe(false);
  });

  test('Return `true` when input is greater than 1', () => {
    expect(previousPageExists(2)).toBe(true);
    expect(previousPageExists(10)).toBe(true);
    expect(previousPageExists(9999)).toBe(true);
  });
});
