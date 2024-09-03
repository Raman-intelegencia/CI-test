import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import Masthead from './Masthead';

describe('Masthead Component Tests', () => {
  it('has a link to the marketing site', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Masthead />, div);

    const link = div.querySelector('.masthead__button');
    expect(link.getAttribute('href').match(/^https:\/\/americanmessaging.net\/$/i)).toBeTruthy();

    ReactDOM.unmountComponentAtNode(div);
  });

  it('applies extra className prop', () => {
    const wrapper = shallow(<Masthead className="abc123" />);
    expect(wrapper.hasClass('abc123')).toBeTruthy();
  });

  it('applies alignment prop as className modifier', () => {
    const wrapper = shallow(<Masthead alignment="abc123" />);
    expect(wrapper.hasClass('masthead--abc123')).toBeTruthy();
  });
});
