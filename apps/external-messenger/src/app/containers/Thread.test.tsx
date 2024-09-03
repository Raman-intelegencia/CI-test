import React from 'react';
import "@types/jest";
import { shallow } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';

import Thread from './Thread';
import { fetcher } from '../helpers/fetcher';

// some info on testing axios here: https://blog.pragmatists.com/genuine-guide-to-testing-react-redux-applications-6f3265c11f63
// NOTE: not currently testing cookie roundtrips/server auth logic

const MockFetcher = new MockAdapter(fetcher);

const THREAD_NEEDS_AUTH = {"status": "error", "phone_number": "(***) ***-1234", "sender": "Seed1 User", "error": "auth", "message": "An authentication code was sent to your phone", "recipient": "thursday two"};
MockFetcher.onPost('external/thread/load/will_find_id').reply(200, THREAD_NEEDS_AUTH);
const THREAD = {"status": "ok", "user_id": "5b118eb7f3e61107896b88e4", "profiles": [{"profile": {"iid": "cureatr", "iname": "Cureatr Inc.", "ishort": "Cureatr"}, "status": {"s": "available", "is_signed_out": false}, "first_name": "(212) 555-1234", "last_name": " ", "image_id": "", "flag_active": true, "_id": "5b118eb7f3e61107896b88e4", "type": "external"}, {"profile": {"ishort": "Cureatr", "dept": "Other", "title": "Demo User", "iname": "Cureatr Inc.", "iid": "cureatr"}, "status": {"s": "busy", "is_signed_out": false}, "first_name": "Seed1", "last_name": "User", "image_id": "7f9a4e0df1ef45249309f011c329ec5d", "date_last_login": "2018-06-25T20:07:16.580000", "flag_active": true, "_id": "5ad4f51e51c356b70a2c4478", "type": "standard"}], "thread": {"messages": [{"status": "read", "user_id": "5ad4f51e51c356b70a2c4478", "time_created": "2018-06-28T15:54:04.766000", "content": "sdfadf as df", "type": "user", "id": "5b35049c51c356bfafd8f1af", "statuses": [{"status": "read", "_id": "5b35049c51c356bfafd8f1b1", "user_id": "5b118eb7f3e61107896b88e4", "message_id": "5b35049c51c356bfafd8f1af", "time_read": "2018-06-28T15:54:27.961000"}, {"status": "read", "_id": "5b35049c51c356bfafd8f1b3", "user_id": "5ad4f51e51c356b70a2c4478", "message_id": "5b35049c51c356bfafd8f1af", "time_read": "2018-06-28T15:54:04.777000"}]}, {"status": "read", "user_id": "5ad4f51e51c356b70a2c4478", "time_created": "2018-06-28T15:54:04.740000", "content": "Seed1 User started the conversation with (212) 555-1234", "type": "system", "id": "5b35049c51c356bfafd8f1aa", "statuses": [{"status": "read", "_id": "5b35049c51c356bfafd8f1ac", "user_id": "5b118eb7f3e61107896b88e4", "message_id": "5b35049c51c356bfafd8f1aa", "time_read": "2018-06-28T15:54:04.752000"}, {"status": "read", "_id": "5b35049c51c356bfafd8f1ae", "user_id": "5ad4f51e51c356b70a2c4478", "message_id": "5b35049c51c356bfafd8f1aa", "time_read": "2018-06-28T15:54:04.755000"}]}], "expiration": "2018-06-29T15:54:04.736000", "user_id": "5ad4f51e51c356b70a2c4478", "id": "5b35049c51c356bfafd8f1a9", "subject": "thursday two"}}
MockFetcher.onPost('external/thread/load/authenticated_will_find_id').reply(200, THREAD);

const THREAD_NOT_FOUND_RESPONSE = {"status": "error", "message": "The secure messaging conversation you have requested does not exist. "};
MockFetcher.onPost('external/thread/load/wont_find_id').reply(200, THREAD_NOT_FOUND_RESPONSE);
const THREAD_MISMATCH_RESPONSE = {"status": "error", "message": "This device is not authorized to view the secure messaging conversation you requested.", "error": "auth_mismatch"}
MockFetcher.onPost('external/thread/load/authenticated_will_mismatch').reply(200, THREAD_MISMATCH_RESPONSE);

// use to debug all requests
// MockFetcher.onAny().reply(function(config) {
//   console.log('any config',JSON.stringify(config, null, 2));
//   return [200];
// });

const flushAllPromises = () => new Promise(resolve => setImmediate(resolve));

it('renders without crashing (shallow)', () => {
  const match = {
    params: {
      user_thread_external_id: 'success'
    }
  };
  shallow(<Thread match={ match } />);
});

describe('login tests', () => {
  it('going to known id produces login', async () => {
    const match = {
      params: {
        user_thread_external_id: 'will_find_id',
      }
    };

    const wrapper = shallow(<Thread match={ match } />);
    // <div /> until promise resolves
    await flushAllPromises();
    wrapper.update();

    expect(wrapper.find('Login').length).toBe(1);
  });

  // spy fails / causes 404 - see https://github.com/ctimmerm/axios-mock-adapter/issues/116
  xit('login page submits credentials', async () => {
    const match = {
      params: {
        user_thread_external_id: 'will_find_id',
      }
    };

    const wrapper = shallow(<Thread match={ match } />);

    let spy = jest.spyOn(MockFetcher, 'onPost');
    // <div /> until promise resolves
    await flushAllPromises();
    wrapper.update();

    wrapper.instance().handleLoginSubmit({code: '12345'});
    await flushAllPromises();
    wrapper.update();

    expect(spy).toHaveBeenCalled();
  });
});

describe('thread tests', () => {
  let wrapper;

  beforeEach(() => wrapper = shallow(<Thread match={{params: { user_thread_external_id: 'authenticated_will_find_id'}}} />));

  it('going to known id, while authenticated, produces thread', async () => {
    // <div /> until promise resolves
    await flushAllPromises();
    wrapper.update();

    expect(wrapper.find('Title').length).toBe(1);
    expect(wrapper.find('ThreadContent').length).toBe(1);
    expect(wrapper.find('ComposeBox').length).toBe(1);
  });

  it('open thread handles options open/close', async () => {
    // <div /> until promise resolves
    await flushAllPromises();
    wrapper.update();

    expect.assertions(3);

    // while we have the thread open, test options opening
    wrapper.instance().handleOptionsOpen();
    wrapper.update();
    expect(wrapper.find('Options').length).toBe(1);

    // test options closing
    wrapper.instance().handleOptionsClose();
    wrapper.update();
    expect(wrapper.find('Options').length).toBe(0);
    expect(wrapper.find('ThreadContent').length).toBe(1);
  });

  // spy fails / causes 404 - see https://github.com/ctimmerm/axios-mock-adapter/issues/116
  xit('open thread handles submit calls', async () => {
    let spy = jest.spyOn(MockFetcher, 'onPost');
    // <div /> until promise resolves
    await flushAllPromises();
    wrapper.update();

    wrapper.instance().handleComposeBoxSubmit({text: 'abc1234'});
    await flushAllPromises();
    wrapper.update();

    expect(spy).toHaveBeenCalled();
  });
});

describe('negative tests', () => {
  it('going to unknown id produces not found error', async () => {
    const match = {
      params: {
        user_thread_external_id: 'wont_find_id',
      }
    };

    const wrapper = shallow(<Thread match={ match } />);
    // <div /> until promise resolves
    await flushAllPromises();
    wrapper.update();

    expect(wrapper.find('Notice').length).toBe(1);
  });

  it('going to mismatched id produces error and has logout button', async () => {
    const match = {
      params: {
        user_thread_external_id: 'authenticated_will_mismatch',
      }
    };

    const wrapper = shallow(<Thread match={ match } />);
    // <div /> until promise resolves
    await flushAllPromises();
    wrapper.update();

    expect(wrapper.find('Notice').length).toBe(1);
    expect(wrapper.find('Notice').dive().html()).toContain('notice__button--logout');
  });
});

function xit(arg0: string, arg1: () => Promise<void>) {
  throw new Error('Function not implemented.');
}
