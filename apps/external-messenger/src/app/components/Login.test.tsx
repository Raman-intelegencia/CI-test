import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import Login from './Login';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Login />, div);
  ReactDOM.unmountComponentAtNode(div);
});

describe("non login actions behave", () => {
  it('resend code button has proper onclick handler', () => {
    const onButtonClick = sinon.spy();
    const wrapper = shallow(<Login onResendCode={onButtonClick} />);
    wrapper.find('.login__button--resend').simulate('click');
    expect(onButtonClick.calledOnce).toBeTruthy();
  });

  it('cancel button has proper onclick handler', () => {
    const onButtonClick = sinon.spy();
    const wrapper = shallow(<Login onLeaveThread={onButtonClick} />);
    wrapper.find('.login__button--cancel').simulate('click');
    expect(onButtonClick.calledOnce).toBeTruthy();
  });

  it('has a link to our TOS', () => {
    const wrapper = shallow(<Login />);
    expect(wrapper.find('[href="https://api.amsconnectapp.com/legal/agreement/amsconnect/tos/latest"]').length).toBe(1);
  });
});
