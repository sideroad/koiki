import 'babel-polyfill';
// import jest from 'jest';
import React from 'react';
import { Route } from 'react-router';
import { expect } from 'chai';
import express from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';

import server from '../server';

jest.fn('console', () => ({ log: () => {}}));
jest.mock('react-dom/server', () => ({
  renderToString: () => {}
}));

const app = express();
app.use(bodyParser.json());

server({
  urls: {
    person: {
      gets: {
        method: 'GET'
      }
    }
  },
  reducers: {
    test: (state = {}) => state
  },
  routes: () => <Route />,
  app,
  isDevelopment: true,
  path: '/',
  origin: 'localhost:3000',
  i18ndir: __dirname + '/i18n',
  manifest: {
    name: 'test-app'
  }
});

describe('server', () => {
  it('should be return static contents', done => {
    request(app)
      .get('/koiki-sw.js')
      .expect(200)
      .end((err) => {
        done(err);
      });
  });
  it('should be provided manifest.json', done => {
    request(app)
      .get('/manifest.json')
      .expect(200)
      .end((err, res) => {
        expect(res.body.name).to.equal('test-app');
        done(err);
      });
  });
});
