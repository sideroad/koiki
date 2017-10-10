import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom/server';
import Helmet from 'react-helmet';
import Body from './Body';

/**
 * Wrapper component containing HTML metadata and boilerplate tags.
 * Used in server-side code only to wrap the string output of the
 * rendered route component.
 *
 * The only thing this component doesn't (and can't) include is the
 * HTML doctype declaration, which is added to the rendered output
 * by the server.js file.
 */
export default class Html extends Component {
  static propTypes = {
    assets: PropTypes.object,
    component: PropTypes.node,
    store: PropTypes.object,
    statics: PropTypes.object,
    fetcher: PropTypes.object,
    enableScript: PropTypes.bool,
  }

  render() {
    const {assets, component, store, statics, fetcher, enableScript = true} = this.props;
    const content = component ? ReactDOM.renderToString(component) : '';
    const head = Helmet.rewind();

    return (
      <html lang="en-us">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <script src="/koiki-sw-register.js" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="shortcut icon" href="/images/favicon.png" />
          <link rel="apple-touch-icon" href="/images/favicon.png" />
          {/* styles (will be present only in production with webpack extract text plugin) */}
          {Object.keys(assets.styles).map((style, key) =>
            <link href={assets.styles[style]} key={key} media="screen, projection"
                  rel="stylesheet" type="text/css" charSet="UTF-8"/>
          )}
          {Object.keys(statics || {}).map((tag) =>
            tag === 'link' ? statics[tag].map((attributes) => <link key={`${attributes.rel}-${attributes.href}`} {...attributes} />) :
            tag === 'script' && enableScript ? statics[tag].map((attributes) => <script key={attributes.src} {...attributes} />) : ''
          )}
          {head.base.toComponent()}
          {head.title.toComponent()}
          {head.meta.toComponent()}
          {head.link.toComponent()}
          {enableScript ? head.script.toComponent() : null}
        </head>
        <Body assets={assets} content={content} store={store} fetcher={fetcher} enableScript={enableScript}/>
      </html>
    );
  }
}
