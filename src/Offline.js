import React from 'react';
import PropTypes from 'prop-types';

const Offline = props =>
  <div
    style={{
      backgroundColor: props.colors.background || 'transparent',
    }}
    className="root"
  >
    <link rel="stylesheet" type="text/css" href="/css/offline.css" />
    <script src="/pulltorefresh.min.js"></script>
    <script src="/pulltorefresh-init.js"></script>
    <div className="container">
      <div className="logo">
        <img
          alt="chaus"
          className="img"
          src="/images/favicon.png"
        />
      </div>
      <div className="message" style={{ color: props.colors.primary }}>
        Network Connection Failed
      </div>
      <div className="button">
        <a
          style={{
            backgroundColor: props.colors.primary,
            color: props.colors.secondary,
          }}
          className="reload"
          href=""
        >
          Reload
        </a>
        <div
          style={{ color: props.colors.primary }}
          className="pull-to-refresh"
          href=""
        >
          Pull down to refresh
        </div>
      </div>
    </div>
  </div>;

Offline.propTypes = {
  colors: PropTypes.shape({
    background: PropTypes.string,
    primary: PropTypes.string,
    secondary: PropTypes.string,
  })
};

Offline.defaultProps = {
  colors: {}
};

export default Offline;
