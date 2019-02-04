const { PokeModule } = require('./Poke');
const { storeFunctions, fetchMockFactory } = require('../__mocks__/index');

describe('pokeServer', () => {
  test('Call `fetch` once', async () => {
    expect.assertions(1);
    const fetchMock = fetchMockFactory();
    const pokeModule = new PokeModule(storeFunctions, fetchMock);
    await pokeModule.pokeServer();
    expect(fetchMock.mock.calls.length).toBe(1);
  });

  test('Call `fetch` with a valid url', async () => {
    expect.assertions(1);
    const fetchMock = fetchMockFactory();
    const pokeModule = new PokeModule(storeFunctions, fetchMock);
    await pokeModule.pokeServer();
    const url = fetchMock.mock.calls[0][0];

    // RegExp taken from https://stackoverflow.com/a/3809435
    const urlRegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/i;
    expect(url).toMatch(urlRegExp);
  });

  test("Call `fetch` for the 'poke' endpoint", async () => {
    expect.assertions(1);
    const fetchMock = fetchMockFactory();
    const pokeModule = new PokeModule(storeFunctions, fetchMock);
    await pokeModule.pokeServer();
    const url = fetchMock.mock.calls[0][0];
    expect(url).toMatch(/\/poke$/);
  });
});
