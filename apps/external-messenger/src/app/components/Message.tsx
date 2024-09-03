import React from 'react';
import Attachment from './Attachment';
import './Message.scss';

// Displays a single message bubble, no metadata
const Message = ({ content, type, user_thread_external_id, attachments }) => {
  function urlHandler(message) {
    if (!message) return;
    var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    return message.replace(urlRegex, function (url) {
      var hyperlink = url;
      if (!hyperlink.match('^https?://')) {
        hyperlink = 'http://' + hyperlink;
      }
      return (
        '<a href="' +
        hyperlink +
        '" target="_blank" rel="noopener noreferrer">' +
        url +
        '</a>'
      );
    });
  }
  let urlContent = urlHandler(content);

  function phoneHandler() {
    var phoneRegex = /(\(\d{3}\))?[\s-]?\d{3}[\s-]?\d{7}/gim;
    if (urlContent === undefined) {
      return;
    }
    return urlContent.replace(phoneRegex, function (num) {
      var number = num;
      return (
        '<a href= "tel:' +
        number +
        '" target="_blank" rel="noopener noreferrer">' +
        num +
        '</a>'
      );
    });
  }
  return (
    <div className={`message message--${type}`}>
      <p
        className="message__content"
        dangerouslySetInnerHTML={{ __html: phoneHandler() }}
      ></p>
      {attachments && (
        <Attachment
          attachments={attachments}
          thread_id={user_thread_external_id}
        />
      )}
    </div>
  );
};

export default Message;
