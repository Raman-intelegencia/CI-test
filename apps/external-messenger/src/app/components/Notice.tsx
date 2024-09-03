import React from 'react';

import './Notice.scss';

const Notice = ({ header, message = null, children = null }) => (
  <div className="notice">
    <h1 className="notice__header">{header}</h1>
    {message !== null ? <p className="notice__msg">{message}</p> : null}
    {children}
  </div>
);

export default Notice;
