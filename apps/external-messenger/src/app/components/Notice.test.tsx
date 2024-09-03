import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import Notice from './Notice';

const noticeContents = {
  header: 'Test Header',
  message: 'Test Message',
};

describe('Notice Component Tests', () => {
  it('renders and displays only header', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Notice header={noticeContents.header} />, div);

    const header = div.querySelector('.notice__header');
    const msg = div.querySelector('.notice__msg');
    expect(header.innerHTML).toEqual(noticeContents.header);
    expect(msg).toBeNull();

    ReactDOM.unmountComponentAtNode(div);
  });

  it('renders and displays header and message', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Notice header={noticeContents.header} message={noticeContents.message} />, div);

    const header = div.querySelector('.notice__header');
    const msg = div.querySelector('.notice__msg');
    expect(header.innerHTML).toEqual(noticeContents.header);
    expect(msg.innerHTML).toEqual(noticeContents.message);

    ReactDOM.unmountComponentAtNode(div);
  });

  it('does not render message container if no message', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Notice header={undefined} />, div);

    const msg = div.querySelector('.notice__msg');
    expect(ReactTestUtils.isDOMComponent(msg)).toBeFalsy();

    ReactDOM.unmountComponentAtNode(div);
  });
});
