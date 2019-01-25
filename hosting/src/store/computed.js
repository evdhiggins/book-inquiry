/**
 * This file currently uses commonjs-style modules so that jest
 * tests will run without any additional configuration or pre-processing
 */

// the current starting index for items in api requests
exports.currentIndex = (currentPage, itemsPerRequest) => {
  const isValidNumber = numValue => Number(numValue) > 0;

  if (!isValidNumber(currentPage) || !isValidNumber(itemsPerRequest)) {
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
