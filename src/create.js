import { createStore as _createStore, applyMiddleware } from 'redux';
import { routerMiddleware } from 'react-router-redux';

export default function createStore({reducers, history, data, isDevelopment}) {
  // Sync dispatched route actions to the history
  const reduxRouterMiddleware = routerMiddleware(history);

  const middleware = [reduxRouterMiddleware];

  let finalCreateStore;
  finalCreateStore = applyMiddleware(...middleware)(_createStore);

  const reducer = require('./reducer')(reducers);
  const store = finalCreateStore(reducer, data);


  if (isDevelopment && module.hot) {
    module.hot.accept('./reducer', () => {
      store.replaceReducer(require('./reducer')(reducers));
    });
  }

  return store;
}
