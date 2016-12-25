import fetchMock from 'fetch-mock';

fetchMock.get('https://chaus.herokuapp.com/apis/koiki/people?offset=0&limit=5', {
  'first': '/apis/koiki/people?offset=0&limit=5',
  'items': [
    { 'age': 30, 'createdAt': '2016-10-15T04:42:29.000Z', 'hobbies': { 'href': '/apis/koiki/people/sideroad/hobbies' }, 'id': 'sideroad', 'name': 'sideroad', 'updatedAt': '2016-10-15T04:42:29.000Z', },
    { 'age': 30, 'createdAt': '2016-10-15T04:42:29.000Z', 'hobbies': { 'href': '/apis/koiki/people/koiki/hobbies' }, 'id': 'koiki', 'name': 'koiki', 'updatedAt': '2016-10-15T04:42:29.000Z', },
    { 'age': 30, 'createdAt': '2016-10-15T04:42:29.000Z', 'hobbies': { 'href': '/apis/koiki/people/hogehoge/hobbies' }, 'id': 'hogehoge', 'name': 'hogehoge', 'updatedAt': '2016-10-15T04:42:29.000Z', },
    { 'age': 30, 'createdAt': '2016-10-15T04:42:29.000Z', 'hobbies': { 'href': '/apis/koiki/people/foo/hobbies' }, 'id': 'foo', 'name': 'foo', 'updatedAt': '2016-10-15T04:42:29.000Z', },
    { 'age': 30, 'createdAt': '2016-10-15T04:42:29.000Z', 'hobbies': { 'href': '/apis/koiki/people/bar/hobbies' }, 'id': 'bar', 'name': 'bar', 'updatedAt': '2016-10-15T04:42:29.000Z', },
  ],
  'last': '/apis/koiki/people?offset=10&limit=5',
  'limit': 5,
  'next': '/apis/koiki/people?offset=5&limit=5',
  'offset': 0,
  'prev': null,
  'size': 13,
});

fetchMock.get('https://chaus.herokuapp.com/apis/koiki/people?offset=5&limit=5', {
  'first': '/apis/koiki/people?offset=0&limit=5',
  'items': [
    { 'age': 30, 'createdAt': '2016-10-15T04:42:29.000Z', 'hobbies': { 'href': '/apis/koiki/people/apple/hobbies' }, 'id': 'apple', 'name': 'apple', 'updatedAt': '2016-10-15T04:42:29.000Z', },
    { 'age': 30, 'createdAt': '2016-10-15T04:42:29.000Z', 'hobbies': { 'href': '/apis/koiki/people/grape/hobbies' }, 'id': 'grape', 'name': 'grape', 'updatedAt': '2016-10-15T04:42:29.000Z', },
    { 'age': 30, 'createdAt': '2016-10-15T04:42:29.000Z', 'hobbies': { 'href': '/apis/koiki/people/orange/hobbies' }, 'id': 'orange', 'name': 'orange', 'updatedAt': '2016-10-15T04:42:29.000Z', },
    { 'age': 30, 'createdAt': '2016-10-15T04:42:29.000Z', 'hobbies': { 'href': '/apis/koiki/people/nope/hobbies' }, 'id': 'nope', 'name': 'nope', 'updatedAt': '2016-10-15T04:42:29.000Z', },
    { 'age': 30, 'createdAt': '2016-10-15T04:42:29.000Z', 'hobbies': { 'href': '/apis/koiki/people/yes/hobbies' }, 'id': 'yes', 'name': 'yes', 'updatedAt': '2016-10-15T04:42:29.000Z', },
  ],
  'last': '/apis/koiki/people?offset=10&limit=5',
  'limit': 5,
  'next': '/apis/koiki/people?offset=10&limit=5',
  'offset': 5,
  'prev': '/apis/koiki/people?offset=0&limit=5',
  'size': 13,
});

fetchMock.get('https://chaus.herokuapp.com/apis/koiki/people?offset=10&limit=5', {
  'first': '/apis/koiki/people?offset=0&limit=5',
  'items': [
    { 'age': 30, 'createdAt': '2016-10-15T04:42:29.000Z', 'hobbies': { 'href': '/apis/koiki/people/apple/hobbies' }, 'id': 'apple', 'name': 'apple', 'updatedAt': '2016-10-15T04:42:29.000Z', },
    { 'age': 30, 'createdAt': '2016-10-15T04:42:29.000Z', 'hobbies': { 'href': '/apis/koiki/people/grape/hobbies' }, 'id': 'grape', 'name': 'grape', 'updatedAt': '2016-10-15T04:42:29.000Z', },
    { 'age': 30, 'createdAt': '2016-10-15T04:42:29.000Z', 'hobbies': { 'href': '/apis/koiki/people/orange/hobbies' }, 'id': 'orange', 'name': 'orange', 'updatedAt': '2016-10-15T04:42:29.000Z', },
  ],
  'last': '/apis/koiki/people?offset=10&limit=5',
  'limit': 5,
  'next': null,
  'offset': 10,
  'prev': '/apis/koiki/people?offset=5&limit=5',
  'size': 13,
});
