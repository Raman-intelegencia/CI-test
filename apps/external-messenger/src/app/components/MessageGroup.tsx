import React from 'react';
import TimeAgo from 'react-timeago';
import Message from './Message';
import Profile from './Profile';
import './MessageGroup.scss';


// Groups a few messages, with metadata from last one displayed
const MessageGroup = ({
  messages,
  type,
  recipient,
  user_thread_external_id,
  profile = null,
}) => {
  // metadata displayed is derived from last message
  const lastInGroup = messages[messages.length - 1];
  const profileName =
    type === 'sent' ? 'You' : `${profile.first_name} ${profile.last_name}`;
  const profileInitials =
    type === 'sent'
      ? 'Y'
      : `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`;
  const useInitials = type !== 'sent';
  const displayStatus = type === 'sent';
  // find the status of the other user
  const lastInGroupStatus = lastInGroup.statuses.find((status) => {
    return status.user_id === recipient;
  });

  return (
    <div className={`messagegroup messagegroup--${type}`}>
      {profile && type !== 'system' ? (
        <header className="messagegroup__profile">
          <Profile
            name={profileName}
            initials={profileInitials}
            useInitials={useInitials}
            icon={profile.image_id}
          />
        </header>
      ) : null}
      <div className="messagegroup__messages">
        {messages.map((message) => {
          return (
            <Message
              key={message.id}
              type={type}
              content={message.content}
              user_thread_external_id={user_thread_external_id}
              attachments={
                typeof message.attachments !== 'undefined'
                  ? message.attachments[0].id
                  : false
              }
            />
          );
        })}
      </div>
      <div className="messagegroup__meta">
        {displayStatus ? <>{lastInGroupStatus.status} • </> : null}
        Sent <TimeAgo date={`${lastInGroup.time_created}Z`} live={false} />
      </div>
    </div>
  );
};

export default MessageGroup;

