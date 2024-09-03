import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import ThreadContent from './ThreadContent';

// system message x1
// cureatr x3
// external x3
// cureatr x1
// external x1
const SAMPLE_PAYLOAD = {
	"status": "ok",
	"user_id": "5b118eb7f3e61107896b88e4",
	"profiles": [{
		"profile": {
			"iid": "cureatr",
			"iname": "Cureatr Inc.",
			"ishort": "Cureatr"
		},
		"status": {
			"s": "available",
			"is_signed_out": false
		},
		"first_name": "(212) 555-1234",
		"last_name": " ",
		"image_id": "",
		"flag_active": true,
		"_id": "5b118eb7f3e61107896b88e4",
		"type": "external"
	}, {
		"profile": {
			"ishort": "Cureatr",
			"dept": "Other",
			"title": "Demo User",
			"iname": "Cureatr Inc.",
			"iid": "cureatr"
		},
		"status": {
			"s": "busy",
			"is_signed_out": false
		},
		"first_name": "Seed1",
		"last_name": "User",
		"image_id": "7f9a4e0df1ef45249309f011c329ec5d",
		"date_last_login": "2018-06-25T20:07:16.580000",
		"flag_active": true,
		"_id": "5ad4f51e51c356b70a2c4478",
		"type": "standard"
	}],
	"thread": {
		"messages": [{
			"status": "read",
			"user_id": "5b118eb7f3e61107896b88e4",
			"time_created": "2018-06-25T20:43:59.964000",
			"content": "and one last from the external user",
			"type": "user",
			"id": "5b31540f51c3561cb56fbc3f",
			"statuses": [{
				"status": "read",
				"_id": "5b31540f51c3561cb56fbc41",
				"user_id": "5b118eb7f3e61107896b88e4",
				"message_id": "5b31540f51c3561cb56fbc3f",
				"time_read": "2018-06-25T20:43:59.966000"
			}, {
				"status": "unread",
				"_id": "5b31540f51c3561cb56fbc43",
				"user_id": "5ad4f51e51c356b70a2c4478",
				"message_id": "5b31540f51c3561cb56fbc3f"
			}]
		}, {
			"status": "read",
			"user_id": "5ad4f51e51c356b70a2c4478",
			"time_created": "2018-06-25T20:14:15.226000",
			"content": "an additional message from the provisioned user",
			"type": "user",
			"id": "5b314d1751c3561cb56fbb66",
			"statuses": [{
				"status": "read",
				"_id": "5b314d1751c3561cb56fbb68",
				"user_id": "5b118eb7f3e61107896b88e4",
				"message_id": "5b314d1751c3561cb56fbb66",
				"time_read": "2018-06-25T20:14:18.427000"
			}, {
				"status": "read",
				"_id": "5b314d1751c3561cb56fbb6a",
				"user_id": "5ad4f51e51c356b70a2c4478",
				"message_id": "5b314d1751c3561cb56fbb66",
				"time_read": "2018-06-25T20:14:15.230000"
			}]
		}, {
			"status": "read",
			"user_id": "5b118eb7f3e61107896b88e4",
			"time_created": "2018-06-25T20:13:18.205000",
			"content": "last message from external user",
			"type": "user",
			"id": "5b314cde51c3561cb56fbb51",
			"statuses": [{
				"status": "read",
				"_id": "5b314cde51c3561cb56fbb53",
				"user_id": "5b118eb7f3e61107896b88e4",
				"message_id": "5b314cde51c3561cb56fbb51",
				"time_read": "2018-06-25T20:13:18.209000"
			}, {
				"status": "read",
				"_id": "5b314cde51c3561cb56fbb55",
				"user_id": "5ad4f51e51c356b70a2c4478",
				"message_id": "5b314cde51c3561cb56fbb51",
				"time_read": "2018-06-25T20:13:18.466000"
			}]
		}, {
			"status": "read",
			"user_id": "5b118eb7f3e61107896b88e4",
			"time_created": "2018-06-25T20:13:11.517000",
			"content": "second message from external user",
			"type": "user",
			"id": "5b314cd751c3561cb56fbb41",
			"statuses": [{
				"status": "read",
				"_id": "5b314cd751c3561cb56fbb43",
				"user_id": "5b118eb7f3e61107896b88e4",
				"message_id": "5b314cd751c3561cb56fbb41",
				"time_read": "2018-06-25T20:13:11.519000"
			}, {
				"status": "read",
				"_id": "5b314cd751c3561cb56fbb45",
				"user_id": "5ad4f51e51c356b70a2c4478",
				"message_id": "5b314cd751c3561cb56fbb41",
				"time_read": "2018-06-25T20:13:11.789000"
			}]
		}, {
			"status": "read",
			"user_id": "5b118eb7f3e61107896b88e4",
			"time_created": "2018-06-25T20:13:04.703000",
			"content": "first message from external user",
			"type": "user",
			"id": "5b314cd051c3561cb56fbb31",
			"statuses": [{
				"status": "read",
				"_id": "5b314cd051c3561cb56fbb33",
				"user_id": "5b118eb7f3e61107896b88e4",
				"message_id": "5b314cd051c3561cb56fbb31",
				"time_read": "2018-06-25T20:13:04.711000"
			}, {
				"status": "read",
				"_id": "5b314cd051c3561cb56fbb35",
				"user_id": "5ad4f51e51c356b70a2c4478",
				"message_id": "5b314cd051c3561cb56fbb31",
				"time_read": "2018-06-25T20:13:04.992000"
			}]
		}, {
			"status": "read",
			"user_id": "5ad4f51e51c356b70a2c4478",
			"time_created": "2018-06-25T20:08:04.807000",
			"content": "this is a third message in a group",
			"type": "user",
			"id": "5b314ba451c3561cb56fbb14",
			"statuses": [{
				"status": "read",
				"_id": "5b314ba451c3561cb56fbb16",
				"user_id": "5b118eb7f3e61107896b88e4",
				"message_id": "5b314ba451c3561cb56fbb14",
				"time_read": "2018-06-25T20:12:55.139000"
			}, {
				"status": "read",
				"_id": "5b314ba451c3561cb56fbb18",
				"user_id": "5ad4f51e51c356b70a2c4478",
				"message_id": "5b314ba451c3561cb56fbb14",
				"time_read": "2018-06-25T20:08:04.813000"
			}]
		}, {
			"status": "read",
			"user_id": "5ad4f51e51c356b70a2c4478",
			"time_created": "2018-06-25T20:07:54.003000",
			"content": "this is a second message",
			"type": "user",
			"id": "5b314b9a51c3561cb56fbb0a",
			"statuses": [{
				"status": "read",
				"_id": "5b314b9a51c3561cb56fbb0c",
				"user_id": "5b118eb7f3e61107896b88e4",
				"message_id": "5b314b9a51c3561cb56fbb0a",
				"time_read": "2018-06-25T20:12:55.167000"
			}, {
				"status": "read",
				"_id": "5b314b9a51c3561cb56fbb0e",
				"user_id": "5ad4f51e51c356b70a2c4478",
				"message_id": "5b314b9a51c3561cb56fbb0a",
				"time_read": "2018-06-25T20:07:54.020000"
			}]
		}, {
			"status": "read",
			"user_id": "5ad4f51e51c356b70a2c4478",
			"time_created": "2018-06-25T20:07:41.706000",
			"content": "hi there",
			"type": "user",
			"id": "5b314b8d51c3561cb56fbaff",
			"statuses": [{
				"status": "read",
				"_id": "5b314b8d51c3561cb56fbb01",
				"user_id": "5b118eb7f3e61107896b88e4",
				"message_id": "5b314b8d51c3561cb56fbaff",
				"time_read": "2018-06-25T20:12:55.179000"
			}, {
				"status": "read",
				"_id": "5b314b8d51c3561cb56fbb03",
				"user_id": "5ad4f51e51c356b70a2c4478",
				"message_id": "5b314b8d51c3561cb56fbaff",
				"time_read": "2018-06-25T20:07:41.718000"
			}]
		}, {
			"status": "read",
			"user_id": "5ad4f51e51c356b70a2c4478",
			"time_created": "2018-06-25T20:07:41.673000",
			"content": "Seed1 User started the conversation with (212) 555-1234",
			"type": "system",
			"id": "5b314b8d51c3561cb56fbafa",
			"statuses": [{
				"status": "read",
				"_id": "5b314b8d51c3561cb56fbafc",
				"user_id": "5b118eb7f3e61107896b88e4",
				"message_id": "5b314b8d51c3561cb56fbafa",
				"time_read": "2018-06-25T20:07:41.682000"
			}, {
				"status": "read",
				"_id": "5b314b8d51c3561cb56fbafe",
				"user_id": "5ad4f51e51c356b70a2c4478",
				"message_id": "5b314b8d51c3561cb56fbafa",
				"time_read": "2018-06-25T20:07:41.687000"
			}]
		}],
		"expiration": "2018-06-26T20:07:41.670000",
		"user_id": "5ad4f51e51c356b70a2c4478",
		"id": "5b314b8d51c3561cb56fbaf9",
		"subject": "Monday John"
	}
};


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ThreadContent />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('applies extra className prop', () => {
  const wrapper = shallow(<ThreadContent className="abc123" />);
  expect(wrapper.hasClass('abc123')).toBeTruthy();
});

describe('Message processing ', () => {
  const wrapper = shallow(<ThreadContent messages={SAMPLE_PAYLOAD.thread.messages} profiles={SAMPLE_PAYLOAD.profiles} recipient={SAMPLE_PAYLOAD.thread.user_id} />);
  // test that we calculated MessageGroups properly -- should be 3 total
  expect(wrapper.find('MessageGroup').length).toBe(4);
  // test that the order is reversed / last MessageGroup message with proper id
  expect(wrapper.find('MessageGroup').last().prop('messages')[0].id).toBe(SAMPLE_PAYLOAD.thread.messages[0].id);

  // test that type is calculated correctly - external users's POV
  expect(wrapper.find('MessageGroup').first().prop('type')).toBe('received');
});
