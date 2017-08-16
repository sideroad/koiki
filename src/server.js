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
import createRouterOpts from './createRouterOpts';

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

export default function server({app, path, urls, origin, i18ndir, reducers, routes, handlers, statics, isDevelopment, name, description}) {
  const i18n = {};
  loadi18n(i18ndir, i18n);

  app.get('/manifest.json', (req, res) => {
    const lang = String.trim((req.headers['accept-language'] || '').split(',')[0].split('-')[0].split('_')[0]) || 'en';

    res.json({
      dir: 'ltr',
      lang,
      name: name || origin,
      display: 'fullscreen',
      start_url: `${origin}/${lang}`,
      short_name: name || origin,
      theme_color: 'transparent',
      description: description || '',
      orientation: 'any',
      background_color: 'transparent',
      related_applications: [],
      prefer_related_applications: false,
      icons: [
        {
          src: '/images/favicon.png',
          type: 'image/png',
          sizes: '48x48'
        },
        {
          src: '/images/favicon.png',
          type: 'image/png',
          sizes: '72x72'
        },
        {
          src: '/images/favicon.png',
          type: 'image/png',
          sizes: '96x96'
        },
        {
          src: '/images/favicon.png',
          type: 'image/png',
          sizes: '144x144'
        },
        {
          src: '/images/favicon.png',
          type: 'image/png',
          sizes: '168x168'
        },
        {
          src: '/images/favicon.png',
          type: 'image/png',
          sizes: '192x192'
        },
        {
          src: '/images/favicon.png',
          type: 'image/png',
          sizes: '256x256'
        },
        {
          src: '/images/favicon.png',
          type: 'image/png',
          sizes: '384x384'
        },
        {
          src: '/images/favicon.png',
          type: 'image/png',
          sizes: '512x512'
        }
      ]
    });
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

    const store = createStore({reducers, history});
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
