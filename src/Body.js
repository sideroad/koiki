import React, { Component } from 'react';
import PropTypes from 'prop-types';
import serialize from 'serialize-javascript';

export default class Body extends Component {
  static propTypes = {
    content: PropTypes.string,
    store: PropTypes.object,
    assets: PropTypes.object,
    fetcher: PropTypes.object
  };

  render() {
    const {
      content,
      store,
      assets,
      fetcher
    } = this.props;
    // const styles = require('../css/customize.less');
    return (
      <body>
        <div id="content" dangerouslySetInnerHTML={{__html: content}}/>
        <script dangerouslySetInnerHTML={{__html: `window.__data=${serialize(store.getState())};`}} charSet="UTF-8"/>
        <script dangerouslySetInnerHTML={{__html: `window.__fetcher=${serialize(fetcher)};`}} charSet="UTF-8"/>
        <script src={assets.javascript.main} charSet="UTF-8"/>
      </body>
    );
  }
}
