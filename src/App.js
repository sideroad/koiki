import React, {Component, PropTypes} from 'react';
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
    i18n: PropTypes.object.isRequired,
    cookie: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
  }

  getChildContext() {
    const fetcher = this.props.route.fetcher;
    return {
      fetcher,
      lang: this.props.params.lang,
      i18n: this.props.i18n.msg,
      cookie: this.props.route.cookie
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
