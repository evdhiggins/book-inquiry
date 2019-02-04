const { StoreModule } = require('../StoreModule');

// ENVIRONMENT is replaced with 'dev' / 'prod' on serve / build
// eslint-disable-next-line no-constant-condition
const baseUrl = 'ENVIRONMENT' === 'dev'
  ? 'http://localhost:5000/book-inquiry/us-central1/api/'
  : 'https://us-central1-book-inquiry.cloudfunctions.net/api/';

class PokeModule extends StoreModule {
  constructor(storeFunctions, fetch) {
    super(storeFunctions);
    // wrap fetch to avoid changing fetch's `this` context
    this._fetch = (...args) => fetch(...args);
  }

  async pokeServer() {
    try {
      await this._fetch(`${baseUrl}poke`);
    } catch (_) {
      // do nothing if poke call fails
    }
  }
}

module.exports = { PokeModule };
