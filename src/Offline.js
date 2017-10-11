import React from 'react';

const Offline = () =>
  <div className="root">
    <link rel="stylesheet" type="text/css" href="/css/offline.css" />
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
        <button
          className="reload"
          onClick={() => location.reload()}
        >
          Reload
        </button>
      </div>
    </div>
  </div>;

Offline.propTypes = {
};

export default Offline;
