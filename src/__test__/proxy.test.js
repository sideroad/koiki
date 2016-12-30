import express from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';
import { expect } from 'chai';
import 'should';
import proxy from '../proxy';

import './proxy.mock';

const app = express();
app.use(bodyParser.json());

proxy({
  app,
  protocol: 'https',
  host: 'chaus.herokuapp.com',
  prefix: '/context',
  logger: () => {},
  before: (url, options, cb) => {
    cb([url + '?limit=5', options]);
  },
  customizer: {
    '/context/apis/koiki/hobbies': {
      GET: {
        before: (url, options, cb) => {
          cb([url + '?limit=7', options]);
        },
        after: (json, cb) => {
          cb({
            ...json,
            foo: 'bar'
          });
        }
      }
    },
    '/context/apis/koiki/colors': {
      GET: {
        override: (req, res) => {
          res.status(400).json({
            url: req.originalUrl,
            message: 'should be fail'
          });
        }
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
  it('should proxy POST request', (done) => {
    request(app)
      .post('/context/apis/koiki/people')
      .send({
        name: 'test',
        age: 10
      })
      .expect(201)
      .end((err, res) => {
        expect(res.body).to.deep.equal({
          id: 'test',
          href: '/apis/koiki/people/test'
        });
        done(err);
      });
  });
  it('should faild proxy POST request', (done) => {
    request(app)
      .post('/context/apis/koiki/people')
      .send({})
      .expect(400)
      .end((err, res) => {
        expect(res.body).to.deep.equal({
          name: 'Invalid value[undefined]',
          age: 'Invalid value[undefined]'
        });
        done(err);
      });
  });
  it('should proxy DELETE request', (done) => {
    request(app)
      .delete('/context/apis/koiki/people/test')
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.deep.equal({});
        done(err);
      });
  });
});
