import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import Options from './Options';

describe('Options Component Tests', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Options sender={undefined} onLeaveThread={undefined} onOptionsClose={undefined} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  it('has a link to our TOS', () => {
    const wrapper = shallow(<Options sender={undefined} onLeaveThread={undefined} onOptionsClose={undefined} />);
    expect(wrapper.find('[href="https://api.amsconnectapp.com/legal/agreement/amsconnect/tos/latest"]').length).toBe(1);
  });

  it('leave button has proper onclick handler', () => {
    const onButtonClick = sinon.spy();
    const wrapper = shallow(<Options onLeaveThread={onButtonClick} sender={undefined} onOptionsClose={undefined} />);
    wrapper.find('.options__button--cancel').simulate('click');
    expect(onButtonClick.calledOnce).toBeTruthy();
  });

  it('close button has proper onclick handler', () => {
    const onButtonClick = sinon.spy();
    const wrapper = shallow(<Options onOptionsClose={onButtonClick} sender={undefined} onLeaveThread={undefined} />);
    wrapper.find('.options__button--optionsclose').simulate('click');
    expect(onButtonClick.calledOnce).toBeTruthy();
  });
});
