import React from 'react';
import ReactDOM from 'react-dom';
import Message from './Message';

describe('Notice Component Tests', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    const messageProps = {
      content: 'This is a message content',
      type: 'info',
      user_thread_external_id: 'user123',
      attachments: []
    };
    ReactDOM.render(<Message content={undefined} type={undefined} user_thread_external_id={undefined} attachments={undefined} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  it('renders content prop', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Message content={'abc123'} type={undefined} user_thread_external_id={undefined} attachments={undefined} />, div);

    const content = div.querySelector('.message__content').innerHTML;
    expect(content).toBe('abc123');

    ReactDOM.unmountComponentAtNode(div);
  });

  it('outputs type as class modifier', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Message type="asdf" content={undefined} user_thread_external_id={undefined} attachments={undefined} />, div);

    const worked = div.querySelector('.message').classList.contains('message--asdf');
    expect(worked).toBe(true);

    ReactDOM.unmountComponentAtNode(div);
  });
});
