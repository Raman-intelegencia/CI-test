import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'universal-cookie';

import ComposeBox from '../components/ComposeBox';
import Login from '../components/Login';
import Notice from '../components/Notice';
import Options from '../components/Options';
import ThreadContent from '../components/ThreadContent';
import Title from '../components/Title';

import { fetcher } from '../helpers/fetcher';
import './Thread.scss';
import { useParams } from 'react-router';
import { environment } from '../../../../../libs/shared/src/lib/config/environment';

const RESPONSE_ERROR_STATUS = 'error';
const RESPONSE_AUTH_ERROR = 'auth';
const RESPONSE_AUTH_MISMATCH_ERROR = 'auth_mismatch';
const POLL_INTERVAL = 10000;
const Thread = () => {
  const composeboxRef = useRef(null);
  const params = useParams().user_thread_external_id;

  const [state, setState] = useState({
    lastPayload: null,
    user_thread_external_id: params,
    loading: false,
    poll: true,
    threadMessages: null,
    notice: null,
    show: null,
    status: null,
    statusType: null,
    recipient: null,
    expiration: null,
    metaPhone: null,
    metaSender: null,
    metaRecipient: null,
    externalThreadId: '',
  });

  const timeoutRef = useRef(null);
  useEffect(() => {
    fetchThread(state.user_thread_external_id);
  }, [state.user_thread_external_id]);

  const fetchThreadUpdate = () => {
    const next = state.user_thread_external_id;
    fetcher.post(`external/thread/load/${next}`).then((response) => {
      if (state.poll) {
        updateThread(next, response);
        initPolling();
      }
    });
  };

  const initPolling = () => {
    if (state.poll) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        fetchThreadUpdate();
      }, POLL_INTERVAL);
    } else {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    initPolling();
  });

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const updateThread = (responseId, response) => {
    if (responseId !== state.user_thread_external_id) {
      return;
    }
    const payload = response.data;
    switch (payload.status) {
      case RESPONSE_ERROR_STATUS:
        switch (payload.error) {
          case RESPONSE_AUTH_ERROR:
            // thread requires auth, we didn't send
            setState((prevState) => ({
              ...prevState,
              lastPayload: payload,
              loading: false,
              notice: null,
              show: 'login',
              threadMessages: null,
              poll: false,
              status: payload.message,
            }));

            // QUESTION: is there a better way to distinguish the initial response from an auth error?
            if (typeof payload.phone_number !== 'undefined') {
              setState((prevState) => ({
                ...prevState,
                metaPhone: payload.phone_number,
                metaSender: payload.sender,
                metaRecipient: payload.recipient,
                statusType: 'warning',
              }));
            } else {
              setState((prevState) => ({
                ...prevState,
                statusType: 'error',
              }));
            }
            break;

          case RESPONSE_AUTH_MISMATCH_ERROR:
            // show error, but with a logout button
            setState((prevState) => ({
              ...prevState,
              lastPayload: payload,
              loading: false,
              notice: {
                header: payload.message,
                message: null,
              },
              show: 'logout',
              threadMessages: null,
              poll: false,
            }));
            break;

          default:
            // for all other status: error display message screen
            setState((prevState) => ({
              ...prevState,
              lastPayload: payload,
              loading: false,
              notice: {
                header: payload.message,
                message: null,
              },
              show: 'notice',
              threadMessages: null,
              poll: false,
            }));
        }
        break;

      // if we're here we think we have thread data
      default:
        // NOTE: we assume the sender is the first profile, that isn't current user
        const assumedSender = payload.profiles.find(
          (profile) => profile._id === payload.thread.user_id
        );
        setState((prevState) => ({
          ...prevState,
          lastPayload: payload,
          loading: false,
          notice: null,
          poll: true,
          show: 'thread',
          threadMessages: payload.thread.messages,
          recipient: payload.thread.user_id,
          metaSender: `${assumedSender.first_name} ${assumedSender.last_name}`,
          metaRecipient: payload.thread.recipient,
          expiration: payload.thread.expiration,
          externalThreadId: payload.user_id,
        }));
    }
  };

  const fetchThread = (next, params = null) => {
    setState((prevState) => ({
      ...prevState, // Maintain previous state properties
      lastPayload: null,
      loading: true,
      notice: null,
      poll: false,
      user_thread_external_id: next,
    }));

    fetcher
      .post(`external/thread/load/${next}`, params)
      .then((response) => {
        updateThread(next, response);
      })
      .catch((error) => {
        let errorMessage = 'An unknown error occurred';
        if (error.response) {
          errorMessage = error.response.statusText;
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = 'The request timed out';
        }
        setState((prevState) => ({
          ...prevState,
          loading: false,
          notice: {
            header: 'Internal API Error',
            message: errorMessage,
          },
          show: 'notice',
        }));
      });
  };

  const handleLoginSubmit = (data) => {
    const params = new URLSearchParams();
    params.append('code', data.code);

    fetchThread(state.user_thread_external_id, params);
  };

  const handleComposeBoxSubmit = (data) => {
    // encode params, http://www.caniuse.com/#feat=urlsearchparams
    const params = new URLSearchParams();
    params.append('message', data.text);

    setState((prevState) => ({
      ...prevState, // Maintain previous state properties
      loading: true,
    }));

    fetcher
      .post(`external/thread/post/${state.user_thread_external_id}`, params)
      .then((response) => {
        switch (response.data.status) {
          case 'ok':
            // push new message onto messages stack & clear
            setState((prevState) => ({
              ...prevState, // Maintain previous state properties
              threadMessages: [
                response.data.message,
                ...prevState.threadMessages,
              ],
            }));
            break;

          default:
            // TODO: how do we inform the user of failure?
            break;
        }

        setState((prevState) => ({
          ...prevState,
          loading: false,
        }));
      });
  };

  const handleResendCode = () => {
    setState((prevState) => ({
      ...prevState,
      loading: true,
    }));

    fetcher
      .post(`external/thread/send_code/${state.user_thread_external_id}`)
      .then((response) => {
        setState((prevState) => ({
          ...prevState,
          loading: false,
          status: response.data.message,
          statusType: 'warning',
        }));
      });
  };

  const handleOptionsOpen = (e) => {
    if (e) {
      e.preventDefault();
    }
    setState((prevState) => ({
      ...prevState,
      poll: false,
      show: 'options',
    }));
  };

  // NOTE: this assumes we have a valid thread to display / were displaying
  const handleOptionsClose = (e) => {
    if (e) {
      e.preventDefault();
    }
    setState((prevState) => ({
      ...prevState,
      poll: true,
      // show: 'thread',
    }));
    fetchThread(state.user_thread_external_id);
  };

  const handleLogout = (e) => {
    if (e) {
      e.preventDefault();
    }
    // logout currently only appears on mismatch, so clear cookies *and* refetch thread
    setState((prevState) => ({
      ...prevState,
      poll: false,
      show: null,
      loading: true,
    }));

    const cookies = new Cookies();
    const cookieDomain = document.location.hostname
      .split('.')
      .slice(-2)
      .join('.');
    cookies.remove('ea', { domain: cookieDomain, path: '/' });
    fetchThread(state.user_thread_external_id);
  };

  const handleLeaveThread = () => {
    setState((prevState) => ({
      ...prevState,
      loading: true,
    }));

    fetcher
      .post(`external/thread/leave/${state.user_thread_external_id}`)
      .then((response) => {
        switch (response.data.status) {
          case 'ok':
          default:
            setState((prevState) => ({
              ...prevState,
              loading: false,
              notice: {
                header: response.data.message.content,
                message: null,
              },
              show: 'notice',
            }));
            break;
        }
      });
  };

  // Rest of your event handling functions

  const renderContent = () => {
    switch (state.show) {
      case 'notice':
        return (
          <Notice header={state.notice.header} message={state.notice.message}>
            <div>
              <p>
                Feel you’ve reached this message in error?{' '}
                <a href={`mailto:${environment.SUPPORT_EMAIL}`}>
                  Contact support
                </a>
                .
              </p>
            </div>
          </Notice>
        );

      case 'options':
        return (
          <Options
            sender={state.metaSender}
            onLeaveThread={handleLeaveThread}
            onOptionsClose={handleOptionsClose}
          />
        );

      case 'logout':
        return (
          <Notice header={state.notice.header} message={state.notice.message}>
            <div>
              <button
                type="button"
                className="notice__button notice__button--logout"
                onClick={handleLogout}
              >
                Reset Authorization
              </button>
              <p>
                Feel you’ve reached this message in error?{' '}
                <a href={`mailto:${environment.SUPPORT_EMAIL}`}>
                  Contact support
                </a>
                .
              </p>
            </div>
          </Notice>
        );

      case 'login':
        return (
          <Login
            user_thread_external_id={state.user_thread_external_id}
            phone_number={state.metaPhone}
            sender={state.metaSender}
            recipient={state.metaRecipient}
            loading={state.loading}
            onLeaveThread={handleLeaveThread}
            onSubmit={handleLoginSubmit}
            onResendCode={handleResendCode}
            status={state.status}
            statusType={state.statusType}
          />
        );

      case 'thread':
        return (
          <div className="thread">
            <Title
              className="thread__layouttop"
              text={`Conversation with ${state.metaSender}`}
              expiration={`${state.expiration}Z`}
              onOptions={handleOptionsOpen}
            />
            <ThreadContent
              className="thread__layoutmiddle"
              messages={state.threadMessages}
              profiles={state.lastPayload.profiles}
              recipient={state.recipient}
              user_thread_external_id={state.user_thread_external_id}
              externalUserId={state.externalThreadId}
            />
            <ComposeBox
              className="thread__layoutbottom"
              innerRef={composeboxRef}
              loading={state.loading}
              onSubmit={handleComposeBoxSubmit}
            />
          </div>
        );

      default:
        break;
    }

    return <div></div>;
  };

  return renderContent();
};
export default Thread;

