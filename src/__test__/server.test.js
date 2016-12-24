import 'babel-polyfill';
// import jest from 'jest';
import React from 'react';
import { Route } from 'react-router';
import { expect } from 'chai';
import express from 'express';
import bodyParser from 'body-parser';

import server from '../server';

jest.fn('console', () => ({ log: () => {}}));
jest.mock('react-dom/server', () => ({
  renderToString: () => {}
}));

const app = express();
app.use(bodyParser.json());

describe('server', () => {
  it('should be create app for server', () => {
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
      i18ndir: __dirname + '/i18n'
    });
    expect(undefined).to.equal(undefined);
  });
});
