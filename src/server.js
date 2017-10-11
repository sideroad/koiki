import React from 'react';
import ReactDOM from 'react-dom/server';
import { Route, match } from 'react-router';
import { ReduxAsyncConnect, loadOnServer } from 'redux-connect';
import createHistory from 'react-router/lib/createMemoryHistory';
import { Provider } from 'react-redux';
import recursive from 'recursive-readdir-sync';
import PropertiesReader from 'properties-reader';
import CookieDough from 'cookie-dough';
import express from 'express';
import createStore from './create';
import { set } from './i18n';
import ApiClient from './apiclient';
import Fetcher from './fetcher';
import stringify from './stringify';
import createRouterOpts from './createRouterOpts';
import Html from './Html';
import App from './App';
import Offline from './Offline';

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

export default function server({
  app,
  path,
  urls,
  origin,
  i18ndir,
  reducers,
  routes,
  handlers,
  statics,
  isDevelopment = false,
  manifest = {},
  colors = {},
}) {
  const i18n = {};
  loadi18n(i18ndir, i18n);
  if (Offline) {
    app.get('/offline', (req, res) => {
      res.send('<!doctype html>\n' +
        ReactDOM.renderToString(
          <Html
            assets={webpackIsomorphicTools.assets()}
            component={<Offline colors={colors} />}
            store={{getState: () => {}}}
            statics={statics}
            enableScript={false}
          />
        )
      );
    });
  }
  app.use('/', express.static(`${__dirname}/static`));
  app.get('/manifest.json', (req, res) => {
    const lang = String.trim((req.headers['accept-language'] || '').split(',')[0].split('-')[0].split('_')[0]) || 'en';

    res.json(Object.assign({
      dir: 'ltr',
      lang,
      name: origin,
      display: 'fullscreen',
      start_url: `${origin}/${lang}`,
      short_name: origin,
      theme_color: 'transparent',
      description: '',
      orientation: 'any',
      background_color: colors.background || 'transparent',
      related_applications: [],
      prefer_related_applications: false,
      icons: ['48', '72', '96', '144', '168', '192', '256', '384', '512'].map(size => ({
        src: '/images/favicon.png',
        type: 'image/png',
        sizes: `${size}x${size}`
      }))
    }, manifest));
  });

  app.get('*', (req, res, next) => {
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
    const history = createHistory(createRouterOpts());

    const store = createStore({reducers, history, isDevelopment});
    store.dispatch(set( i18n[req.params.lang] ));

    const fetcher = new Fetcher({
      client,
      dispatch: store.dispatch,
      urls,
      type: 'server'
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

    match({
      history,
      routes: <Route
                urls={urls}
                origin={origin}
                component={App}
                cookie={cookie}
                fetcher={fetcher}
              >
                {routes(store, cookie)}
              </Route>,
      location: req.originalUrl
    }, (error, redirectLocation, renderProps) => {
      if (redirectLocation) {
        res.redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (error) {
        handlers.error(error);
        res.set('Content-Type', 'text/html');
        res.status(500);
        hydrateOnClient();
      } else if (renderProps) {
        loadOnServer({...renderProps, store, cookie, helpers: {fetcher}}).then(() => {
          const component = (
            <Provider store={store} key="provider">
              <ReduxAsyncConnect {...renderProps} store={store} />
            </Provider>
          );
          res.set('Content-Type', 'text/html');
          res.status(200);

          global.navigator = {userAgent: req.headers['user-agent']};
          res.send('<!doctype html>\n' +
            ReactDOM.renderToString(
              <Html
                assets={webpackIsomorphicTools.assets()}
                component={component}
                store={store}
                fetcher={fetcher.get(urls)}
                statics={statics}
              />));
        });
      } else {
        res.set('Content-Type', 'text/html');
        res.status(404).send('Not found');
      }
    });
  });
}
