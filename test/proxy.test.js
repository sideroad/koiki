import express from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';
import 'should';
import proxy from '../src/proxy';

const app = express();
app.use(bodyParser.json());

proxy({
  app,
  protocol: 'https',
  host: 'chaus.herokuapp.com',
  prefix: '/context',
  logger: () => {},
  before: (url, options) => {
    return [url + '?limit=5', options];
  },
  customizer: {
    '/context/apis/koiki/hobbies': {
      before: (url, options) => {
        return [url + '?limit=7', options];
      },
      after: (json) => {
        return {
          ...json,
          foo: 'bar'
        };
      }
    },
    '/context/apis/koiki/colors': {
      override: (req, res) => {
        res.status(400).json({
          url: req.originalUrl,
          message: 'should be fail'
        });
      }
    }
  }
});

describe('proxy', () => {
  it('should proxy GET request with before injection', (done) => {
    request(app)
      .get('/context/apis/koiki/people')
      .expect(200)
      .end((err, res) => {
        res.body.should.have.property('first', '/apis/koiki/people?offset=0&limit=5');
        done(err);
      });
  });
  it('should proxy GET request with customizer before injection', (done) => {
    request(app)
      .get('/context/apis/koiki/hobbies')
      .expect(200)
      .end((err, res) => {
        res.body.should.have.property('first', '/apis/koiki/hobbies?offset=0&limit=7');
        res.body.should.have.property('foo', 'bar');
        done(err);
      });
  });
  it('should proxy GET request with customizer override', (done) => {
    request(app)
      .get('/context/apis/koiki/colors')
      .expect(400)
      .end((err, res) => {
        res.body.should.have.property('message', 'should be fail');
        res.body.should.have.property('url', '/context/apis/koiki/colors');
        done(err);
      });
  });
});
