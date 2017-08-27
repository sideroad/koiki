import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import {reducer as reduxAsyncConnect} from 'redux-connect';
import logger from './logger';
import i18n from './i18n';

export default function getReducers(args, isDevelopment) {
  return combineReducers({
    routing: routerReducer,
    reduxAsyncConnect,
    i18n,
    ...args,
    logger: isDevelopment ? logger : () => ({}),
  });
}
