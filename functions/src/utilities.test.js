const { createSearchUrl, prepareItem } = require('./utilities');

describe('createSearchUrl', () => {
  // shorten for horizontal readability
  const csu = createSearchUrl;
  test('Return a string', () => {
    expect(typeof csu({ q: 'test' }, 'apiKey')).toBe('string');
  });

  test('Return the correct base url', () => {
    const baseUrl = /^https:\/\/www\.googleapis\.com\/books\/v1\/volumes\?/;
    expect(csu({ q: 'test' }, 'apiKey')).toMatch(baseUrl);
  });

  test('Throw an error when `q` input is invalid', () => {
    const callWithQAs = q => () => csu({ q }, 'k');

    // invalid input
    expect(callWithQAs(undefined)).toThrow();
    expect(callWithQAs('')).toThrow();
    expect(callWithQAs({})).toThrow();

    // valid input
    expect(callWithQAs('v')).not.toThrow();
    expect(callWithQAs('תקף')).not.toThrow();
    expect(callWithQAs('صالح')).not.toThrow();
  });

  test('Return basic `q` values properly in query string', () => {
    expect(csu({ q: 'test' }, 'k')).toMatch(/q=test/);
    expect(csu({ q: 'a test' }, 'k')).toMatch(/q=a%20test/);
  });

  test('Convert `q` input containing special characters to URI-safe strings', () => {
    expect(csu({ q: '!@#$%^&*()<>?' }, 'k')).toMatch(/!%40%23%24%25%5E%26\*\(\)%3C%3E%3F/);
    expect(csu({ q: '一本好书' }, 'k')).toMatch(/q=%E4%B8%80%E6%9C%AC%E5%A5%BD%E4%B9%A6/);
    expect(csu({ q: '🐶🐱🐭🐹🐰' }, 'k')).toMatch(
      /q=%F0%9F%90%B6%F0%9F%90%B1%F0%9F%90%AD%F0%9F%90%B9%F0%9F%90%B0/,
    );
  });

  test('Correctly parse `startIndex` input', () => {
    const maxNum = Number.MAX_SAFE_INTEGER;
    expect(csu({ q: 't', startIndex: 5 }, 'k')).toMatch(/startIndex=5/);
    expect(csu({ q: 't', startIndex: maxNum - 1 }, 'k')).toMatch(
      new RegExp(`startIndex=${maxNum - 1}`),
    );
    expect(csu({ q: 't', startIndex: maxNum }, 'k')).toMatch(/startIndex=0/);
    expect(csu({ q: 't', startIndex: -1 }, 'k')).toMatch(/startIndex=0/);
    expect(csu({ q: 't', startIndex: 'ten' }, 'k')).toMatch(/startIndex=0/);
    expect(csu({ q: 't', startIndex: '10' }, 'k')).toMatch(/startIndex=10/);
    expect(csu({ q: 't' }, 'k')).toMatch(/startIndex=0/);
  });

  test('Return a URL containing `field` query value', () => {
    expect(csu({ q: 't' }, 'k')).toMatch(/fields=[^&]+/);
  });

  test('Throw an error when api key is not a string or is empty', () => {
    const callWithKeyAs = key => () => csu({ q: 't' }, key);
    expect(callWithKeyAs(undefined)).toThrow();
    expect(callWithKeyAs('')).toThrow();
    expect(callWithKeyAs({})).toThrow();
    expect(callWithKeyAs('apiKey')).not.toThrow();
  });

  test('Correctly include `key` input', () => {
    expect(csu({ q: 't' }, 'apiKey')).toMatch(/key=apiKey/);
    expect(csu({ q: 't' }, 'a-different-api-key')).toMatch(/key=a-different-api-key/);
  });
});

describe('prepareItem', () => {
  const mockItem = {
    id: 'BEQcj-aFTYYC',
    volumeInfo: {
      title: 'Unruly Examples',
      authors: ['Alexander Gelley', 'A Fake Author'],
      publisher: 'Stanford University Press',
      description:
        "These 2 essays demonstrate that, beyond example's rich genealogy in the rhetorical tradition, it involves issues that are central to current theories of meaning and ethics in literature and philosophy.",

      imageLinks: {
        thumbnail:
          'http://books.google.com/books/content?id=BEQcj-aFTYYC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      },
      infoLink: 'http://books.google.com/books?id=BEQcj-aFTYYC&dq=examples&hl=&source=gbs_api',
    },
    searchInfo: {
      textSnippet:
        'These 2 essays demonstrate that, beyond example&#39;s rich genealogy in the rhetorical tradition, it involves issues that are central to current theories of meaning and ethics in literature and philosophy.',
    },
  };
  const mockPreparedItem = {
    id: 'BEQcj-aFTYYC',
    title: 'Unruly Examples',
    authors: 'Alexander Gelley, A Fake Author',
    description:
      "These 2 essays demonstrate that, beyond example's rich genealogy in the rhetorical tradition, it involves issues that are central to current theories of meaning and ethics in literature and philosophy.",
    publisher: 'Stanford University Press',
    thumbnail:
      'https://books.google.com/books/content?id=BEQcj-aFTYYC&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    infoLink: 'https://books.google.com/books?id=BEQcj-aFTYYC&dq=examples&hl=&source=gbs_api',
  };

  test('Return an object', () => {
    expect(typeof prepareItem(mockItem)).toBe('object');
  });

  describe('Given a correct argument', () => {
    const preparedItem = prepareItem(mockItem);

    test('Return an object with all fields defined', () => {
      Object.keys(mockPreparedItem).forEach((field) => {
        expect(preparedItem[field]).not.toBe(undefined);
      });
    });

    test('Return an object with correct values', () => {
      Object.entries(mockPreparedItem).forEach(([key, value]) => {
        expect(preparedItem[key]).toBe(value);
      });
    });
  });

  describe('Given an invalid argument', () => {
    const callWithItemAs = item => () => prepareItem(item);

    test('Never throw an error', () => {
      expect(callWithItemAs(undefined)).not.toThrow();
      expect(callWithItemAs(null)).not.toThrow();
      expect(callWithItemAs('string')).not.toThrow();
    });

    test('Return an object with empty strings for all fields', () => {
      let preparedItem = prepareItem(undefined);
      Object.keys(mockPreparedItem).forEach((key) => {
        expect(preparedItem[key]).toBe('');
      });

      preparedItem = prepareItem(null);
      Object.keys(mockPreparedItem).forEach((key) => {
        expect(preparedItem[key]).toBe('');
      });
    });
  });

  test('Return `textSnippet` as `description` if no `description` exists', () => {
    const preparedItem = prepareItem({ searchInfo: { textSnippet: 'snippet' } });
    expect(preparedItem.description).toBe('snippet');
  });

  test('Remove html tags from description', () => {
    const preparedItem = prepareItem({ volumeInfo: { description: '<bold>description</bold>' } });
    expect(preparedItem.description).toBe('description');
  });

  test('Decode URI encoded strings', () => {
    const preparedItem = prepareItem({ searchInfo: { textSnippet: '%E5%A4%A9%E6%98%8E' } });
    expect(preparedItem.description).toBe('天明');
  });

  test('Return un-decoded URI string if it is malformed', () => {
    const preparedItem = prepareItem({ volumeInfo: { description: 'Malformed: %E0%A4%A' } });
    expect(preparedItem.description).toBe('Malformed: %E0%A4%A');
  });
});
