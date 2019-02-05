const { StoreModule } = require('../StoreModule');

// ENVIRONMENT is replaced with 'dev' / 'prod' on serve / build
// eslint-disable-next-line no-constant-condition
const baseUrl = 'ENVIRONMENT' === 'dev'
  ? 'http://localhost:5000/book-inquiry/us-central1/api/'
  : 'https://us-central1-book-inquiry.cloudfunctions.net/api/';

class PingModule extends StoreModule {
  oncreate(fetch) {
    // wrap fetch to avoid changing fetch's `this` context
    this._fetch = (...args) => fetch(...args);
  }

  async pingServer() {
    try {
      await this._fetch(`${baseUrl}ping`);
    } catch (_) {
      // do nothing if ping call fails
    }
  }
}

module.exports = { PingModule };
