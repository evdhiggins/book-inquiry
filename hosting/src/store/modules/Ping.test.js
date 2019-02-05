const { PingModule } = require('./Ping');
const { storeFunctions, fetchMockFactory } = require('../__mocks__/index');

describe('pingServer', () => {
  const fetchMock = fetchMockFactory();
  const pingModule = new PingModule(storeFunctions, fetchMock);

  beforeAll(async (done) => {
    await pingModule.pingServer();
    done();
  });

  test('Call `fetch` once', () => {
    expect(fetchMock.mock.calls.length).toBe(1);
  });

  test('Call `fetch` with a valid url', () => {
    // RegExp taken from https://stackoverflow.com/a/3809435
    const urlRegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/i;
    const url = fetchMock.mock.calls[0][0];
    expect(url).toMatch(urlRegExp);
  });

  test("Call `fetch` for the 'ping' endpoint", () => {
    const url = fetchMock.mock.calls[0][0];
    expect(url).toMatch(/\/ping$/);
  });
});
