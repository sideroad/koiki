import React from 'react';
import ReactDOM from 'react-dom/server';
import createStore from './create';
import {set} from './i18n';
import ApiClient from './apiclient';
import Fetcher from './fetcher';
import { Route, match } from 'react-router';
import { ReduxAsyncConnect, loadOnServer } from 'redux-connect';
import createHistory from 'react-router/lib/createMemoryHistory';
import {Provider} from 'react-redux';
import recursive from 'recursive-readdir-sync';
import PropertiesReader from 'properties-reader';
import Html from './Html';
import App from './App';

const loadi18n = (dir, i18n) => {
  const path = require('path');
  const files = recursive( dir );
  files.map(file => {
    console.log('### loading lang files');
    console.log(file);
    const properties = PropertiesReader(file);
    const lang = path.basename(file, '.properties');
    i18n[lang] = properties.getAllProperties();
  });
  console.log(i18n);
};

export default function server({app, path, origin, urls, domain, i18ndir, reducers, routes, handlers, isDevelopment}) {
  const i18n = {};
  loadi18n(i18ndir, i18n);

  app.use(path, (req, res) => {
    if (isDevelopment) {
      // Do not cache webpack stats: the script file would change since
      // hot module replacement is enabled in the development env
      webpackIsomorphicTools.refresh();
    }
    const client = new ApiClient({
      cookie: req.get('cookie'),
      origin: domain,
      referer: domain
    });
    const history = createHistory(req.originalUrl);

    const store = createStore({reducers, history, isDevelopment});
    store.dispatch(set( i18n[req.params.lang] ));

    const fetcher = new Fetcher({
      client,
      dispatch: store.dispatch,
      urls
    });

    function hydrateOnClient() {
      res.send('<!doctype html>\n' +
        ReactDOM.renderToString(<Html assets={webpackIsomorphicTools.assets()} store={store}/>));
    }

    if (__DISABLE_SSR__) {
      hydrateOnClient();
      return;
    }

    match({
      history,
      routes: <Route
                urls={urls}
                origin={origin}
                component={App}
              >
                {routes(store)}
              </Route>,
      location: req.originalUrl
    }, (error, redirectLocation, renderProps) => {
      if (redirectLocation) {
        res.redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (error) {
        handlers.error(error);
        res.status(500);
        hydrateOnClient();
      } else if (renderProps) {
        loadOnServer({...renderProps, store, helpers: {fetcher}}).then(() => {
          const component = (
            <Provider store={store} key="provider">
              <ReduxAsyncConnect {...renderProps} store={store} />
            </Provider>
          );

          res.status(200);

          global.navigator = {userAgent: req.headers['user-agent']};

          res.send('<!doctype html>\n' +
            ReactDOM.renderToString(<Html assets={webpackIsomorphicTools.assets()} component={component} store={store}/>));
        });
      } else {
        res.status(404).send('Not found');
      }
    });
  });
}
