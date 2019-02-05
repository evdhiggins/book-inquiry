const { ItemsModule, encodedSearchString, requestUrl } = require('./Items');
const { storeFunctions, fetchMockFactory } = require('../__mocks__/index');

const fetchMock = fetchMockFactory();
const httpErrorFetchMock = fetchMockFactory(true);
const serverErrorFetchMock = fetchMockFactory(false, true);

const callGetItemsWith = (fetch, searchValue) => async () => {
  const itemStore = new ItemsModule(storeFunctions, fetch);
  await itemStore.getItems({
    searchValue,
    paginationState: { currentPage: 1 },
    itemsPerRequest: 20,
  });
  return itemStore;
};

const storeStateMock = {
  searchValue: 'foo',
  paginationState: { currentPage: 0 },
  itemsPerRequest: 20,
};

// RegExp taken from https://stackoverflow.com/a/3809435
const urlRegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/i;

describe('requestUrl', () => {
  const url = requestUrl({ encodedSearchString: 'a%20bit%20of%20string', startIndex: 20 });

  test('Return a valid url', () => {
    expect(url).toMatch(urlRegExp);
  });

  test('Return url containing URI-encoded `searchValue`', () => {
    expect(url).toMatch(/q=a%20bit%20of%20string/);
  });

  test('Return url containing correct `currentIndex` value', () => {
    expect(url).toMatch(/startIndex=20/);
  });
});

describe('_getStartIndex', () => {
  const getStartIndex = (currentPage, itemsPerRequest) => {
    const itemsStore = new ItemsModule(storeFunctions, fetchMock);
    itemsStore._getStartIndex(currentPage, itemsPerRequest);
    return itemsStore.startIndex;
  };
  test('Return the index of the next item', () => {
    expect(getStartIndex(1, 5)).toBe(0);
    expect(getStartIndex(5, 10)).toBe(40);
  });

  test('Return `0` when either input is NaN or negative', () => {
    expect(getStartIndex(NaN, 5)).toBe(0);
    expect(getStartIndex(-55, 5)).toBe(0);
    expect(getStartIndex(-23, -23)).toBe(0);
    expect(getStartIndex(100)).toBe(0);
  });
});

describe('encodedSearchString', () => {
  test('Return a URI-safe string', () => {
    expect(encodedSearchString({ searchValue: 'a bit of text' })).toBe('a%20bit%20of%20text');
    expect(encodedSearchString({ searchValue: '@#$%^&' })).toBe('%40%23%24%25%5E%26');
    expect(encodedSearchString({ searchValue: 'Լեռները' })).toBe(
      '%D4%BC%D5%A5%D5%BC%D5%B6%D5%A5%D6%80%D5%A8',
    );
  });
});

describe('getItems', () => {
  test('Never throw an error', () => {
    expect(callGetItemsWith(fetchMock, 'foo')).not.toThrowError();
    expect(callGetItemsWith(httpErrorFetchMock, 'foo')).not.toThrowError();
    expect(callGetItemsWith(serverErrorFetchMock, 'foo')).not.toThrowError();
    expect(callGetItemsWith(fetchMock)).not.toThrowError();
    expect(callGetItemsWith(fetchMock, null, 'asdf')).not.toThrowError();
  });

  test('Set `error` to `false` when no error', async () => {
    expect.assertions(1);
    const itemStore = await callGetItemsWith(fetchMock, 'foo')();
    expect(itemStore.error).toBe(false);
  });

  test('Set `error` to `true` when a http error occurs', async () => {
    expect.assertions(1);
    const itemStore = await callGetItemsWith(httpErrorFetchMock, 'foo')();
    expect(itemStore.error).toBe(true);
  });

  test('Set `error` to `true` when a server error occurs', async () => {
    expect.assertions(1);
    const itemStore = await callGetItemsWith(serverErrorFetchMock, 'foo')();
    expect(itemStore.error).toBe(true);
  });

  test('Set `error` to `true` when searchValue is not a truthy string', async () => {
    expect.assertions(3);
    const itemStore1 = await callGetItemsWith(fetchMock, '')();
    const itemStore2 = await callGetItemsWith(fetchMock, null)();
    const itemStore3 = await callGetItemsWith(fetchMock, undefined)();
    expect(itemStore1.error).toBe(true);
    expect(itemStore2.error).toBe(true);
    expect(itemStore3.error).toBe(true);
  });

  test('Call `fetch` once', async () => {
    expect.assertions(1);
    const fetch = fetchMockFactory();
    const itemStore = new ItemsModule(storeFunctions, fetch);
    await itemStore.getItems(storeStateMock);
    expect(fetch.mock.calls.length).toBe(1);
  });

  test('Call `fetch` with a url as an argument', async () => {
    expect.assertions(1);
    const fetch = fetchMockFactory();
    const itemStore = new ItemsModule(storeFunctions, fetch);
    await itemStore.getItems(storeStateMock);
    expect(fetch.mock.calls[0][0]).toMatch(urlRegExp);
  });
});
