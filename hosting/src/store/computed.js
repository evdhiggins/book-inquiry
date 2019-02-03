/**
 * This file currently uses commonjs-style modules so that jest
 * tests will run without any additional configuration or pre-processing
 */

// the current starting index for items in api requests
exports.currentIndex = (paginationState, itemsPerRequest) => {
  const isValidNumber = numValue => Number(numValue) > 0;

  if (!isValidNumber(paginationState.currentPage) || !isValidNumber(itemsPerRequest)) {
    return 0;
  }

  return (paginationState.currentPage - 1) * itemsPerRequest;
};

/**
 * Computed functions are loaded into the store via the following arguments:
 * [0]: the computed value name
 * [1]: all state variables used, in the order they are passed as args
 * [2]: the function that returns the computed value
 */
exports.computedFunctions = [
  ['currentIndex', ['paginationState', 'itemsPerRequest'], exports.currentIndex],
];
