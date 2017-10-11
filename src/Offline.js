import React from 'react';

const Offline = () =>
  <div className="root">
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
      <div className="message">
        Network Connection Failed
      </div>
      <div className="button">
        <a
          className="reload"
          href=""
        >
          Reload
        </a>
        <div
          className="pull-to-refresh"
          href=""
        >
          Pull down to refresh
        </div>
      </div>
    </div>
  </div>;

Offline.propTypes = {
};

export default Offline;
