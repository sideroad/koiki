import pluck from '../url-pluck';

describe('url-parser', () => {
  it('should return URL only needed', () => {
    expect(
      pluck('http://localhost:3000/hogehoge/fugafuga?foo=bar', [ 'protocol', 'host', 'pathname' ])
    ).toBe('http://localhost:3000/hogehoge/fugafuga');

    expect(
      pluck('http://localhost:3000/hogehoge/fugafuga?foo=bar', [ 'host', 'pathname' ])
    ).toBe('localhost:3000/hogehoge/fugafuga');

    expect(
      pluck('', [ 'protocol', 'host', 'pathname' ])
    ).toBe('');

  });
});
