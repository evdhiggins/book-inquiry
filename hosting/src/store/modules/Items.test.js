const {
  ItemsModule, encodedSearchString, requestUrl, startIndex,
} = require('./Items');
const { storeFunctions, fetchMockFactory } = require('../__mocks__/index');

const fetchMock = fetchMockFactory();
const httpErrorFetchMock = fetchMockFactory(true);
const serverErrorFetchMock = fetchMockFactory(false, true);

const callGetItemsWith = (fetch, searchValue, currentIndex) => async () => {
  const itemStore = new ItemsModule(storeFunctions, fetch);
  await itemStore.getItems({ searchValue, currentIndex });
  return itemStore;
};

const storeStateMock = { searchValue: 'foo', currentIndex: 0 };

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

describe('startIndex', () => {
  test('If input is a number greater than or equal to 0 return the input', () => {
    expect(startIndex({ itemIndex: 0 })).toBe(0);
    expect(startIndex({ itemIndex: 100 })).toBe(100);
    expect(startIndex({ itemIndex: 5234 })).toBe(5234);
  });

  test('If input not a number greater than or equal to 0 return 0', () => {
    expect(startIndex({ itemIndex: -10 })).toBe(0);
    expect(startIndex({ itemIndex: null })).toBe(0);
    expect(startIndex({ itemIndex: NaN })).toBe(0);
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
    expect(callGetItemsWith(fetchMock, 'foo', 0)).not.toThrowError();
    expect(callGetItemsWith(httpErrorFetchMock, 'foo', 0)).not.toThrowError();
    expect(callGetItemsWith(serverErrorFetchMock, 'foo', 0)).not.toThrowError();
    expect(callGetItemsWith(fetchMock)).not.toThrowError();
    expect(callGetItemsWith(fetchMock, null, 'asdf')).not.toThrowError();
  });

  test('Set `error` to `false` when no error', async () => {
    expect.assertions(1);
    const itemStore = await callGetItemsWith(fetchMock, 'foo', 0)();
    expect(itemStore.error).toBe(false);
  });

  test('Set `error` to `true` when a http error occurs', async () => {
    expect.assertions(1);
    const itemStore = await callGetItemsWith(httpErrorFetchMock, 'foo', 0)();
    expect(itemStore.error).toBe(true);
  });

  test('Set `error` to `true` when a server error occurs', async () => {
    expect.assertions(1);
    const itemStore = await callGetItemsWith(serverErrorFetchMock, 'foo', 0)();
    expect(itemStore.error).toBe(true);
  });

  test('Set `error` to `true` when searchValue is not a truthy string', async () => {
    expect.assertions(3);
    const itemStore1 = await callGetItemsWith(fetchMock, '', 0)();
    const itemStore2 = await callGetItemsWith(fetchMock, null, 0)();
    const itemStore3 = await callGetItemsWith(fetchMock, undefined, 0)();
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
