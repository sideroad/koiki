import 'babel-polyfill';
// import jest from 'jest';
import React from 'react';
import { Route } from 'react-router';
import { expect } from 'chai';
import client from '../client';

jest.mock('react-dom', () => ({
  render: () => {}
}));

describe('client', () => {
  it('should be create app for client', () => {
    client({
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
      dest: <div/>
    });
    expect(window.React).to.not.equal(undefined);
  });
});
