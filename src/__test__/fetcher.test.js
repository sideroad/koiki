import sinon from 'sinon';

import ApiClient from '../apiclient';
import Fetcher from '../fetcher';

import './fetcher.mock';

describe('client', () => {
  it('should be create app for client', () => {
    const dispatch = sinon.spy();
    const logger = sinon.spy();
    const client = new ApiClient({}, logger);
    const fetcher = new Fetcher({
      urls: {
        person: {
          gets: {
            method: 'GET',
            url: 'https://chaus.herokuapp.com/apis/koiki/people',
            after: (values, res) => {
              expect(values).toMatchSnapshot();
              expect(res.body).toMatchSnapshot();
              return Promise.resolve(res.body);
            },
            next: action => action.next ? `https://chaus.herokuapp.com${action.next}` : ''
          }
        },
        fruit: {
          gets: {
            method: 'GET',
            url: 'https://chaus.herokuapp.com/apis/koiki/fruits',
            cache: {
              server: true
            }
          }
        }
      },
      dispatch,
      client,
      type: 'server'
    });
    return fetcher.person.gets({
      offset: 0,
      limit: 5
    }).then(
      (res) => {
        expect(res.body).toMatchSnapshot();
        expect(res.res.ok).toEqual(true);
        return fetcher.person.gets.next()
          .then(
            () => fetcher.person.gets.next()
          )
          .then(
            () => fetcher.person.gets.next()
          )
          .then(
            () => {
              expect(dispatch.getCall(0).args[0].type).toBe('person/GETS_START');
              expect(dispatch.getCall(0).args[0].body).toBe(undefined);
              expect(dispatch.getCall(1).args[0].type).toBe('person/GETS_SUCCESS');
              expect(dispatch.getCall(1).args[0].body.prev).toBe(null);
              expect(dispatch.getCall(1).args[0].body.next).toBe('/apis/koiki/people?offset=5&limit=5');
              expect(dispatch.getCall(2).args[0].type).toBe('person/GETS_NEXT_START');
              expect(dispatch.getCall(2).args[0].body).toBe(undefined);
              expect(dispatch.getCall(3).args[0].type).toBe('person/GETS_NEXT_SUCCESS');
              expect(dispatch.getCall(3).args[0].body.prev).toBe('/apis/koiki/people?offset=0&limit=5');
              expect(dispatch.getCall(3).args[0].body.next).toBe('/apis/koiki/people?offset=10&limit=5');
              expect(dispatch.getCall(3).args[0].hasNext).toBe(true);
              expect(dispatch.getCall(4).args[0].type).toBe('person/GETS_NEXT_START');
              expect(dispatch.getCall(4).args[0].body).toBe(undefined);
              expect(dispatch.getCall(5).args[0].type).toBe('person/GETS_NEXT_SUCCESS');
              expect(dispatch.getCall(5).args[0].body.prev).toBe('/apis/koiki/people?offset=5&limit=5');
              expect(dispatch.getCall(5).args[0].body.next).toBe(null);
              expect(dispatch.getCall(5).args[0].hasNext).toBe(false);
            }
          )
          .then(
            () => fetcher.fruit.gets({
              offset: 0,
              limit: 5
            })
          )
          .then(
            () => fetcher.fruit.gets({
              offset: 0,
              limit: 5
            })
          )
          .then(() => {
            expect(logger.getCall(3).args[0]).toBe('## fetch ');
            expect(logger.getCall(3).args[1]).toBe('https://chaus.herokuapp.com/apis/koiki/fruits?offset=0&limit=5');
            expect(logger.getCall(4).args[0]).toBe('## return from cache ');
            expect(logger.getCall(4).args[1]).toBe('https://chaus.herokuapp.com/apis/koiki/fruits?offset=0&limit=5');
            expect(dispatch.getCall(6).args[0].type).toBe('fruit/GETS_START');
            expect(dispatch.getCall(7).args[0].type).toBe('fruit/GETS_SUCCESS');
            expect(dispatch.getCall(7).args[0].body.items.length).toBe(1);
            expect(dispatch.getCall(8).args[0].type).toBe('fruit/GETS_START');
            expect(dispatch.getCall(9).args[0].type).toBe('fruit/GETS_SUCCESS');
            expect(dispatch.getCall(9).args[0].body.items.length).toBe(1);
          });
      }
    );
  });
});
