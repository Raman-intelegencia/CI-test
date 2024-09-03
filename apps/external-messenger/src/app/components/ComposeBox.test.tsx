import React from 'react';
import ReactDOM from 'react-dom';
import { mount, shallow } from 'enzyme';
import sinon from 'sinon';
import ComposeBox from './ComposeBox';

describe("ComposeBox renders properly", () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<ComposeBox />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  it('renders className prop', () => {
    const wrapper = shallow(<ComposeBox className="abc123" />);
    expect(wrapper.hasClass('abc123')).toBeTruthy();
  });

  it('has a textarea and submit button', () => {
    const wrapper = mount(<ComposeBox />);
    expect(wrapper.find('textarea.composebox__field').length).toBe(1);
    expect(wrapper.find('input[type="submit"].composebox__button').length).toBe(1);
  });
});

describe("ComposeBox method tests", () => {
  it('form has proper onsubmit handler', () => {
    const onSubmit = sinon.spy();
    const wrapper = mount(<ComposeBox onSubmit={onSubmit} />);
    wrapper.setState({ value: 'abc123' });
    wrapper.find('form').simulate('submit');
    expect(onSubmit.calledOnce).toBeTruthy();
  });

  it('clears text when clear() is called', () => {
    const wrapper = mount(<ComposeBox />);
    wrapper.setState({ value: 'abc123' });
    expect(wrapper.find('textarea.composebox__field').props().value).toBe('abc123');
    wrapper.instance().clear();
    wrapper.update();
    expect(wrapper.find('textarea.composebox__field').props().value).toBe('');
  });
});
