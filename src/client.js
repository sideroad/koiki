/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory, Route } from 'react-router';
import useScroll from 'scroll-behavior/lib/useStandardScroll';
import createStore from './create';
import ApiClient from './apiclient';
import {Provider} from 'react-redux';
import { ReduxAsyncConnect } from 'redux-connect';
import Fetcher from './fetcher';
import App from './App';

export default function client({urls, reducers, routes, isDevelopment}) {
  const history = useScroll(() => browserHistory)();
  const dest = document.getElementById('content');
  const store = createStore({reducers, history, data: window.__data, isDevelopment});
  const fetcher = new Fetcher({
    dispatch: store.dispatch,
    client: new ApiClient(),
    urls
  });

  const component = (
    <Router
      render={(props) =>
        <ReduxAsyncConnect {...props} helpers={{fetcher}} filter={item => !item.deferred} />
      } history={history}>
      <Route
        component={App}
        urls={urls}
      >
        {routes(store)}
      </Route>
    </Router>
  );

  ReactDOM.render(
    <Provider store={store} key="provider">
      {component}
    </Provider>,
    dest
  );

  if (process.env.NODE_ENV !== 'production') {
    window.React = React; // enable debugger

    if (!dest || !dest.firstChild || !dest.firstChild.attributes || !dest.firstChild.attributes['data-react-checksum']) {
      console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.');
    }
  }
}
