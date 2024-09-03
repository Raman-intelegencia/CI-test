import React from 'react';
import TimeAgo from 'react-timeago';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

import './Title.scss';

import optionsIcon from '../assets/options.svg';

// custom formatter example via https://github.com/nmn/react-timeago/issues/72
const formatter = buildFormatter({
  prefixAgo: null,
  prefixFromNow: 'in',
  suffixAgo: 'ago',
  suffixFromNow: null,
  seconds: 'just now',
  minute: '1 minute',
  minutes: '%d minutes',
  hour: '1 hour',
  hours: '%d hours',
  day: '1 day',
  days: '%d days',
  month: '1 month',
  months: '%d months',
  year: '1 year',
  years: '%d years',
  wordSeparator: ' ',
  numbers: [],
});

const Title = ({ text, expiration, onOptions, className = null }) => (
  <header className={`title ${className}`}>
    <div className="title__content">
      <h1 className="title__text">{text}</h1>
      <p className="title__subtext">
        expires <TimeAgo date={expiration} live={false} formatter={formatter} />
      </p>
    </div>
    <div className="title__actions">
      <button className="title__button" type="button" onClick={onOptions}>
        <img src={optionsIcon} alt="Options" />
      </button>
    </div>
  </header>
);

export default Title;

