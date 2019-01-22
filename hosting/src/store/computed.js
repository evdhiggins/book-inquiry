/**
 * This file currently uses commonjs-style modules so that jest
 * tests will run without any additional configuration or pre-processing
 */

// the current index of the first item in the items array
// as it exists in the total number of results available
exports.currentIndex = (currentPage, itemsPerRequest) => {
  const invalidCurrentPage = !(Number(currentPage) > 0);
  const invalidItemsPerRequest = !(Number(itemsPerRequest) > 0);

  if (invalidCurrentPage || invalidItemsPerRequest) {
    return 0;
  }

  return currentPage * itemsPerRequest;
};

exports.nextPageExists = (itemsPerRequest, totalItems, currentPage) => {
  const perRequest = Number(itemsPerRequest) > 0 ? itemsPerRequest : 0;
  const items = Number(itemsPerRequest) > 0 ? totalItems : 0;

  const totalPageCount = Math.floor(items / perRequest);
  if (totalPageCount > currentPage) {
    return true;
  }
  return false;
};

exports.previousPageExists = currentPage => currentPage > 1;

/**
 * Computed functions are loaded into the store via the following arguments:
 * [0]: the computed value name
 * [1]: all state variables used, in the order they are passed as args
 * [2]: the function that returns the computed value
 */
exports.computedFunctions = [
  ['currentIndex', ['currentPage', 'itemsPerRequest'], exports.currentIndex],
  ['nextPageExists', ['itemsPerRequest', 'totalItems', 'currentPage'], exports.nextPageExists],
  ['previousPageExists', ['currentPage'], exports.previousPageExists],
];
