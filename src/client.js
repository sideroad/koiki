/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, useRouterHistory } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import useScroll from 'scroll-behavior/lib/useStandardScroll';
import createStore from './create';
import ApiClient from './apiclient';
import {Provider} from 'react-redux';
import { ReduxAsyncConnect } from 'redux-connect';
import Fetcher from './fetcher';
import App from './App';
import CookieDough from 'cookie-dough';
import createRouterOpts from './createRouterOpts';

export default function client({urls, reducers, routes, dest}) {
  const createScrollHistory = useScroll(createBrowserHistory);
  const history = useRouterHistory(createScrollHistory)(createRouterOpts());

  const store = createStore({reducers, history, data: window.__data});
  const fetcher = new Fetcher({
    dispatch: store.dispatch,
    client: new ApiClient(),
    urls
  });
  const cookie = CookieDough();

  const component = (
    <Router
      render={(props) =>
        <ReduxAsyncConnect {...props} cookie={cookie} helpers={{fetcher}} filter={item => !item.deferred} />
      }
      history={history}
    >
      <Route
        component={App}
        urls={urls}
        cookie={cookie}
      >
        {routes(store, cookie)}
      </Route>
    </Router>
  );

  ReactDOM.render(
    <Provider store={store} key="provider">
      {component}
    </Provider>,
    dest || document.getElementById('content')
  );

  if (process.env.NODE_ENV !== 'production') {
    window.React = React; // enable debugger

    if (!dest || !dest.firstChild || !dest.firstChild.attributes || !dest.firstChild.attributes['data-react-checksum']) {
      console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.');
    }
  }
}
