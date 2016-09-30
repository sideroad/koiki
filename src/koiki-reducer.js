import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import {reducer as reduxAsyncConnect} from 'redux-connect';
import {reducer as form} from 'redux-form';
import logger from './koiki-logger';
import i18n from './koiki-i18n';

export default function getReducers(args) {
  return combineReducers({
    routing: routerReducer,
    reduxAsyncConnect,
    form,
    i18n,
    ...args,
    logger
  });
}
