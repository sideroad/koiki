import React from 'react';
import ReactDOM from 'react-dom/server';
import createStore from './create';
import {set} from './i18n';
import ApiClient from './apiclient';
import Fetcher from './fetcher';
import stringify from './stringify';
import { Route, match } from 'react-router';
import { ReduxAsyncConnect, loadOnServer } from 'redux-connect';
import createHistory from 'react-router/lib/createMemoryHistory';
import {Provider} from 'react-redux';
import recursive from 'recursive-readdir-sync';
import PropertiesReader from 'properties-reader';
import Html from './Html';
import App from './App';
import CookieDough from 'cookie-dough';
import { stringify as stringifyQs, parse } from 'qs'

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

export default function server({app, path, urls, origin, i18ndir, reducers, routes, handlers, statics, isDevelopment}) {
  const i18n = {};
  loadi18n(i18ndir, i18n);

  app.get('*', (req, res, next)=>{
    if ( !isDevelopment && req.headers['x-forwarded-proto'] !== 'https') {
      res.redirect(origin + req.url);
    } else {
      next();
    }
  });

  app.get('/', (req, res)=>{
    const lang = String.trim((req.headers['accept-language'] || '').split(',')[0].split('-')[0].split('_')[0]) || 'en';
    console.log(lang, req.headers['accept-language']);
    res.redirect(stringify( path, {lang} ));
  });

  app.use(path, (req, res, next) => {
    if (!i18n[req.params.lang]) {
      next();
      return;
    }
    if (isDevelopment) {
      // Do not cache webpack stats: the script file would change since
      // hot module replacement is enabled in the development env
      webpackIsomorphicTools.refresh();
    }
    const client = new ApiClient({
      cookie: req.get('cookie'),
      origin: origin,
      referer: origin
    });
    const cookie = new CookieDough(req);
    const stringifyQuery = query => stringifyQs(query, { arrayFormat: 'brackets', encode: false });
    const history = createHistory({
      parseQueryString: parse,
      stringifyQuery
    });

    const store = createStore({reducers, history});
    store.dispatch(set( i18n[req.params.lang] ));

    const fetcher = new Fetcher({
      client,
      dispatch: store.dispatch,
      urls
    });

    function hydrateOnClient() {
      res.send('<!doctype html>\n' +
        ReactDOM.renderToString(
          <Html
            assets={webpackIsomorphicTools.assets()}
            store={store}
            statics={statics}
          />
        )
      );
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
                cookie={cookie}
              >
                {routes(store, cookie)}
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
        loadOnServer({...renderProps, store, cookie, helpers: {fetcher}}).then(() => {
          const component = (
            <Provider store={store} key="provider">
              <ReduxAsyncConnect {...renderProps} store={store} />
            </Provider>
          );

          res.status(200);

          global.navigator = {userAgent: req.headers['user-agent']};

          res.send('<!doctype html>\n' +
            ReactDOM.renderToString(
              <Html
                assets={webpackIsomorphicTools.assets()}
                component={component}
                store={store}
                statics={statics}
              />));
        });
      } else {
        res.status(404).send('Not found');
      }
    });
  });
}
