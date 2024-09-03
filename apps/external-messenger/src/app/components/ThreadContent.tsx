import React, { useEffect, useState, useRef } from 'react';

import MessageGroup from './MessageGroup';
import './ThreadContent.scss';

const ThreadContent = (props) => {
  const [groupedMessages, setGroupedMessages] = useState([]);
  const [targetGroupId, setTargetGroupId] = useState(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  const targetGroupRef = useRef(null);

  const scrollToTarget = () => {
    if (targetGroupRef.current && shouldScroll) {
      targetGroupRef.current
        .querySelector('.messagegroup__meta')
        .scrollIntoView({ behaviour: 'smooth' });
    }
  };

  const processMessages = (messages) => {
    if (!messages) {
      return;
    }
    const reversedMessages = [...messages].reverse();

    let lastUserId = null;
    let lastType = null;
    let groupedIndex = -1;
    const groupMessages = [];

    for (let x = 0; x < reversedMessages.length; x++) {
      const messageX = reversedMessages[x];
      let type = reversedMessages[x].type;
      if (type === 'user') {
        type =
          props.externalUserId === reversedMessages[x].user_id
            ? 'sent'
            : 'received';
      }
      if (messageX.user_id !== lastUserId || type !== lastType) {
        lastUserId = messageX.user_id;
        lastType = type;
        groupedIndex++;
        groupMessages[groupedIndex] = [];
      }
      groupMessages[groupedIndex].push(messageX);
    }

    const lastGroup = groupMessages[groupMessages.length - 1];
    const targetGroupId = lastGroup[0].id;

    let shouldScroll = true;
    if (groupedMessages.length) {
      const oldLastGroup = groupedMessages[groupedMessages.length - 1];
      shouldScroll =
        lastGroup[lastGroup.length - 1].id !==
        oldLastGroup[oldLastGroup.length - 1].id;
    }
    setGroupedMessages(groupMessages);
    setTargetGroupId(targetGroupId);
    setShouldScroll(shouldScroll);
  };

  useEffect(() => {
    processMessages(props.messages);
    scrollToTarget();
  }, [props.messages]);

  useEffect(() => {
    scrollToTarget();
  }, [shouldScroll, targetGroupId]);
  return (
    <div className={`threadcontent ${props.className}`}>
      {groupedMessages.map((group) => {
        const metaMessage = group[group.length - 1];
        const profile = props.profiles.find(
          (profile) => metaMessage.user_id === profile._id
        );
        let type = metaMessage.type;
        if (type === 'user') {
          type =
            props.externalUserId === metaMessage.user_id ? 'sent' : 'received';
        }

        return (
          <div
            key={`${group[0].id}_wrap`}
            className="threadcontent__groupwrap"
            ref={group[0].id === targetGroupId ? targetGroupRef : null}
          >
            <MessageGroup
              key={group[0].id}
              messages={group}
              recipient={props.recipient}
              user_thread_external_id={props.user_thread_external_id}
              profile={profile}
              type={type}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ThreadContent;

