import React, {Component, PropTypes} from 'react';
import ApiClient from './apiclient';
import Fetcher from 'redux-fetch-dispatcher';
import { connect } from 'react-redux';

@connect(
  state => ({
    i18n: state.i18n
  }),
  dispatch => ({
    dispatch: (...args) => dispatch(...args)
  })
)
export default class App extends Component {
  static propTypes = {
    route: PropTypes.object.isRequired,
    router: PropTypes.object,
    children: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
    i18n: PropTypes.object.isRequired
  };

  static childContextTypes = {
    fetcher: PropTypes.object.isRequired,
    lang: PropTypes.string.isRequired,
    i18n: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
  }

  getChildContext() {
    const req = this.props.router ? this.props.router.req : undefined;
    return {
      fetcher: new Fetcher({
        urls: this.props.route.urls,
        dispatch: this.props.dispatch,
        client: new ApiClient(req ? {
          cookie: req.get('cookie'),
          origin: this.props.route.origin,
          referer: this.props.route.origin
        } : undefined)
      }),
      lang: this.props.params.lang,
      i18n: this.props.i18n.msg,
    };
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
