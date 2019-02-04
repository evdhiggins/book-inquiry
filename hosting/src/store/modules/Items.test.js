const { ItemsModule } = require('./Items');
const { storeFunctions, fetchMockFactory } = require('../__mocks__/index');

const fetchMock = fetchMockFactory();
const httpErrorFetchMock = fetchMockFactory(true);
const serverErrorFetchMock = fetchMockFactory(false, true);

const callGetItemsWith = (fetch, searchValue, currentIndex) => () => {
  const itemStore = new ItemsModule(storeFunctions, fetch);
  return itemStore.getItems({ searchValue, currentIndex });
};

const storeStateMock = { searchValue: 'foo', currentIndex: 0 };

describe('getItems', () => {
  test('Return an object that contains `error`, `items`, and `totalItems`', async () => {
    expect.assertions(4);
    const itemStore = new ItemsModule(storeFunctions, fetchMock);
    const response = await itemStore.getItems({ searchValue: 'foo', currentIndex: 0 });

    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('error');
    expect(response).toHaveProperty('items');
    expect(response).toHaveProperty('totalItems');
  });

  test('Never throw an error', () => {
    expect(callGetItemsWith(fetchMock, 'foo', 0)).not.toThrowError();
    expect(callGetItemsWith(httpErrorFetchMock, 'foo', 0)).not.toThrowError();
    expect(callGetItemsWith(serverErrorFetchMock, 'foo', 0)).not.toThrowError();
    expect(callGetItemsWith(fetchMock)).not.toThrowError();
    expect(callGetItemsWith(fetchMock, null, 'asdf')).not.toThrowError();
  });

  test("Returned object's `error` property is `false` when no error", async () => {
    expect.assertions(1);
    const response = await callGetItemsWith(fetchMock, 'foo', 0)();
    expect(response.error).toBe(false);
  });

  test("Returned object's `error` property is `true` when a http error occurs", async () => {
    expect.assertions(1);
    const response = await callGetItemsWith(httpErrorFetchMock, 'foo', 0)();
    expect(response.error).toBe(true);
  });

  test("Returned object's `error` property is `true` when a server error occurs", async () => {
    expect.assertions(1);
    const response = await callGetItemsWith(serverErrorFetchMock, 'foo', 0)();
    expect(response.error).toBe(true);
  });

  test("Returned object's `error` property is `true` when searchValue is not a truthy string", async () => {
    expect.assertions(3);
    const response1 = await callGetItemsWith(serverErrorFetchMock, '', 0)();
    const response2 = await callGetItemsWith(serverErrorFetchMock, null, 0)();
    const response3 = await callGetItemsWith(serverErrorFetchMock, undefined, 0)();
    expect(response1.error).toBe(true);
    expect(response2.error).toBe(true);
    expect(response3.error).toBe(true);
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

    // RegExp taken from https://stackoverflow.com/a/3809435
    const urlRegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/i;
    expect(fetch.mock.calls[0][0]).toMatch(urlRegExp);
  });

  test('Call `fetch` with URI-encoded `searchValue`', async () => {
    expect.assertions(1);
    const fetch = fetchMockFactory();
    const itemStore = new ItemsModule(storeFunctions, fetch);
    await itemStore.getItems({ searchValue: 'a bit of string', currentIndex: 0 });

    expect(fetch.mock.calls[0][0]).toMatch(/q=a%20bit%20of%20string/);
  });

  test('Call `fetch` with correct `currentIndex` value', async () => {
    expect.assertions(1);
    const fetch = fetchMockFactory();
    const itemStore = new ItemsModule(storeFunctions, fetch);
    await itemStore.getItems({ searchValue: 'foo', currentIndex: 20 });

    expect(fetch.mock.calls[0][0]).toMatch(/startIndex=20/);
  });
});
