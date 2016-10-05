import React, {Component, PropTypes} from 'react';
import serialize from 'serialize-javascript';

export default class Body extends Component {
  static propTypes = {
    content: PropTypes.string,
    store: PropTypes.object,
    assets: PropTypes.object
  };

  render() {
    const {
      content,
      store,
      assets
    } = this.props;
    // const styles = require('../css/customize.less');
    return (
      <body>
        <div id="content" dangerouslySetInnerHTML={{__html: content}}/>
        <script dangerouslySetInnerHTML={{__html: `window.__data=${serialize(store.getState())};`}} charSet="UTF-8"/>
        <script src={assets.javascript.main} charSet="UTF-8"/>
      </body>
    );
  }
}
