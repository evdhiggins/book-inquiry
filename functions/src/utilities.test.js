const { createSearchUrl } = require('./utilities');

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

  test('Correctly parse `q` input', () => {
    expect(csu({ q: 'test' }, 'k')).toMatch(/q=test/);
    expect(csu({ q: 'a test' }, 'k')).toMatch(/q=a test/);
    expect(csu({ q: '!@#$%^&*()<>?' }, 'k')).toMatch(/!@#\$%\^&\*\(\)<>\?/);
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
