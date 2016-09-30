import React from 'react';
import ReactDOM from 'react-dom/server';
import createStore from './koiki-create';
import {set} from './koiki-i18n';
import ApiClient from 'promise-apiclient';
import Fetcher from 'redux-fetch-dispatcher';
import { match } from 'react-router';
import { ReduxAsyncConnect, loadOnServer } from 'redux-connect';
import createHistory from 'react-router/lib/createMemoryHistory';
import {Provider} from 'react-redux';

export default function server({app, uris, urls, i18n, reducers, Html, routes, handlers}) {

  app.use(uris.apps.apps, (req, res) => {
    if (__DEVELOPMENT__) {
      // Do not cache webpack stats: the script file would change since
      // hot module replacement is enabled in the development env
      webpackIsomorphicTools.refresh();
    }
    const client = new ApiClient({
      cookie: req.get('cookie'),
      origin: uris.base,
      referer: uris.base
    });
    const history = createHistory(req.originalUrl);

    const store = createStore(reducers, history);
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

    match({ history, routes: routes(store), location: req.originalUrl }, (error, redirectLocation, renderProps) => {
      if (redirectLocation) {
        res.redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (error) {
        handers.error(error);
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
