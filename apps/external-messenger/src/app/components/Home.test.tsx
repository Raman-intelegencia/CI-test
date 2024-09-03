import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import Home from './Home';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Home />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('should have one <Masthead />', () => {
  const wrapper = shallow(<Home />);
  expect(wrapper.find('Masthead').length).toBe(1);
});
