const { currentIndex: ci } = require('./computed');

// wrap main `currentIndex` function to simplify call signature
const currentIndex = (currentPage, itemsPerRequest) => ci({ currentPage }, itemsPerRequest);

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
