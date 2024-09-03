import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import Title from './Title';

describe('Title Component Tests', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Title text={undefined} expiration={undefined} onOptions={undefined} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  it('properly renders text prop', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Title text={'abc123'} expiration={undefined} onOptions={undefined} />, div);

    const text = div.querySelector('.title__text').innerHTML;
    expect(text).toBe('abc123');

    ReactDOM.unmountComponentAtNode(div);
  });

  it('options button has proper onclick handler', () => {
    const onButtonClick = sinon.spy();
    const wrapper = shallow(<Title onOptions={onButtonClick} text={undefined} expiration={undefined} />);
    wrapper.find('.title__button').simulate('click');
    expect(onButtonClick.calledOnce).toBeTruthy();
  });
});
