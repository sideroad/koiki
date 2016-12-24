import ApiClient from '../apiclient';
import Fetcher from '../fetcher';

describe('client', () => {
  it('should be create app for client', (done) => {
    const client = new ApiClient();
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
            }
          }
        }
      },
      dispatch: () => {},
      client
    });
    fetcher.person.gets().then(
      (res) => {
        expect(res.body).toMatchSnapshot();
        expect(res.res.ok).toEqual(true);
        done();
      }
    );
  });
});
