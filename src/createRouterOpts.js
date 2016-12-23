import { stringify as stringifyQs, parse } from 'qs';

export default function createRouterOpts(option = {}) {
  return {
    parseQueryString: parse,
    stringifyQuery: query => stringifyQs(
      query,
      {
        arrayFormat: 'brackets',
        encode: false
      }),
    ...option
  };
}
