import React, { useState } from 'react';
import CodeInput from 'react-code-input';
import { replaceAsterisksWithDots } from '../helpers/index';
import './Login.scss';

const CODE_LENGTH = 5;

const Login = (props) => {
  const [code, setCode] = useState('');

  const updateCode = (newCode) => {
    setCode(newCode);
    if (newCode.length >= CODE_LENGTH) {
      props.onSubmit({ code: newCode });
    }
  };

  const resendCode = (e) => {
    if (e) {
      e.preventDefault();
    }

    props.onResendCode();
    setCode('');
  };

  const leaveThread = (e) => {
    if (e) {
      e.preventDefault();
    }

    props.onLeaveThread();
  };

  const formattedPhoneNumber = props.phone_number
    ? replaceAsterisksWithDots(props.phone_number)
    : '';

  return (
    <div className="login">
      <h1 className="login__text">
        You have a secure message from {props.sender}
      </h1>
      <p className="login__text login__text--long">
        We sent a <span className="nobr">{CODE_LENGTH}-digit</span> code to{' '}
        <span className="nobr">{formattedPhoneNumber}</span> please enter it
        below
      </p>
      {!props.loading ? (
        <CodeInput
          key="codeactive"
          className="login__input"
          type="number"
          fields={CODE_LENGTH}
          onChange={updateCode}
          pattern="[0-9]*"
          inputMode="numeric"
          name={''}
        />
      ) : (
        <CodeInput
          key="codeinactive"
          className="login__input"
          type="number"
          fields={CODE_LENGTH}
          disabled={true}
          pattern="[0-9]*"
          inputMode="numeric"
          name={''}
        />
      )}
      <div className={`login__statusbox login__statusbox--${props.statusType}`}>
        {props.status ? <p className="login__status">{props.status}</p> : null}
      </div>
      <p className="login__text login__text--long">
        By entering the authentication code, you agree to our{' '}
        <a href="https://api.amsconnectapp.com/legal/agreement/amsconnect/tos/latest">
          Terms of Service
        </a>
        . If you do not agree, do not enter the authentication code and cancel
        this message below.
      </p>
      <p className="login__text">
        Didn't receive your code?
        <br />
        <button
          className="login__button login__button--resend"
          type="button"
          onClick={resendCode}
        >
          Resend Code
        </button>
      </p>
      <p className="login__text">
        Not {props.recipient}?
        <br />
        <button
          className="login__button login__button--cancel"
          type="button"
          onClick={leaveThread}
        >
          Cancel this message
        </button>
      </p>
    </div>
  );
};

export default Login;

