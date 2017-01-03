import fetchMock from 'fetch-mock';

fetchMock.get('https://chaus.herokuapp.com/apis/koiki/hobbies?limit=7', {
  'offset': 0,
  'limit': 7,
  'size': 3,
  'first': '/apis/koiki/hobbies?offset=0&limit=7',
  'last': '/apis/koiki/hobbies?offset=0&limit=7',
  'prev': null,
  'next': null,
  'items': [
    {
      'updatedAt': '2016-10-15T04:42:59.000Z',
      'createdAt': '2016-10-15T04:42:59.000Z',
      'name': 'engineering',
      'id': 'engineering'
    },
    {
      'updatedAt': '2016-10-15T04:43:35.000Z',
      'createdAt': '2016-10-15T04:43:35.000Z',
      'name': 'snowboarding',
      'id': 'snowboarding'
    },
    {
      'updatedAt': '2016-10-15T04:43:47.000Z',
      'createdAt': '2016-10-15T04:43:47.000Z',
      'name': 'boweling',
      'id': 'boweling'
    }
  ]
});

fetchMock.get('https://chaus.herokuapp.com/apis/koiki/people?limit=5', {
  'offset': 0,
  'limit': 25,
  'size': 3,
  'first': '/apis/koiki/people?offset=0&limit=5',
  'last': '/apis/koiki/people?offset=0&limit=5',
  'prev': null,
  'next': null,
  'items': [
    {
      'updatedAt': '2016-10-15T04:42:29.000Z',
      'createdAt': '2016-10-15T04:42:29.000Z',
      'hobbies': {
        'href': '/apis/koiki/people/sideroad/hobbies'
      },
      'age': 30,
      'name': 'sideroad',
      'id': 'sideroad'
    },
    {
      'updatedAt': '2016-10-15T04:42:48.000Z',
      'createdAt': '2016-10-15T04:42:48.000Z',
      'hobbies': {
        'href': '/apis/koiki/people/koiki/hobbies'
      },
      'age': 30,
      'name': 'koiki',
      'id': 'koiki'
    },
    {
      'updatedAt': '2016-12-30T07:11:54.000Z',
      'createdAt': '2016-12-30T07:11:54.000Z',
      'hobbies': {
        'href': '/apis/koiki/people/test/hobbies'
      },
      'age': 10,
      'name': 'test',
      'id': 'test'
    }
  ]
});

fetchMock.post('https://chaus.herokuapp.com/apis/koiki/colors/red', {
  'updatedAt': '2016-12-17T03:32:21.000Z',
  'createdAt': '2016-12-17T03:30:32.000Z',
  'code': '#AA0000',
  'name': 'red',
  'id': 'red'
});

fetchMock.mock('https://chaus.herokuapp.com/apis/koiki/people?limit=5', (urls, opts)=> {
  const body = JSON.parse(opts.body);
  return body.name === 'test' ? {
    id: 'test',
    href: '/apis/koiki/people/test'
  } : {
    name: 'Invalid value[undefined]',
    age: 'Invalid value[undefined]'
  };
});

fetchMock.delete('https://chaus.herokuapp.com/apis/koiki/people/test?limit=5', {
});
