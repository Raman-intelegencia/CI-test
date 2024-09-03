import React from 'react';

import './Masthead.scss';
import logo from '../assets/AMS_single_color.svg';

// Displays a single message bubble, no metadata
const Masthead = ({ alignment = 'left', className = '' }) => (
  <header className={`masthead masthead--${alignment} ${className}`}>
    <h1>
      <img className="masthead__logo" src={logo} alt="AMSConnect" />
    </h1>
    <h2 className="masthead__slogan">
      Lightweight secure messaging built for healthcare providers .
    </h2>
    <p>
      <a className="masthead__button" href="https://americanmessaging.net/">
        Learn More
      </a>
    </p>
  </header>
);

export default Masthead;
