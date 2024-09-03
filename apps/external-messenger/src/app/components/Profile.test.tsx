import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import Profile from './Profile';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Profile />, div);
  ReactDOM.unmountComponentAtNode(div);
});

describe('Icon Tests', () => {
  it('displays icon when provided', () => {
    expect.assertions(2);
    const div = document.createElement('div');
    ReactDOM.render(<Profile icon={'abc123'} />, div);

    const icon = div.querySelector('.profile__icon');
    expect(ReactTestUtils.isDOMComponent(icon)).toBeTruthy();

    if (icon) {
      expect(icon.getAttribute('src')).toContain('abc123_profile.png');
    }

    ReactDOM.unmountComponentAtNode(div);
  });
});

describe('No Icon Tests', () => {
  it('displays initials, not icon when useInitials === true', () => {
    expect.assertions(3);
    const div = document.createElement('div');
    ReactDOM.render(<Profile initials={'CC'} useInitials={true} />, div);

    const icon = div.querySelector('.profile__icon');
    const initials = div.querySelector('.profile__initials');
    expect(ReactTestUtils.isDOMComponent(icon)).toBeFalsy();
    expect(ReactTestUtils.isDOMComponent(initials)).toBeTruthy();

    if (initials) {
      expect(initials.innerHTML).toBe('CC');
    }

    ReactDOM.unmountComponentAtNode(div);
  });
  it('displays icon, not initials when useInitials === false', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Profile initials={'CC'} useInitials={false} />, div);

    const icon = div.querySelector('.profile__icon');
    const initials = div.querySelector('.profile__initials');
    expect(ReactTestUtils.isDOMComponent(icon)).toBeTruthy();
    expect(ReactTestUtils.isDOMComponent(initials)).toBeFalsy();

    ReactDOM.unmountComponentAtNode(div);
  });
});
