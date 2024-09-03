import React from 'react';
import { shallow } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import Versions from './Versions';

const MockFetcher = new MockAdapter(axios);
MockFetcher.onGet('/versions/').reply(200, [
  { "name":"1532553564", "type":"directory", "mtime":"Wed, 25 Jul 2018 21:19:27 GMT" },
  { "name":"1532704782", "type":"directory", "mtime":"Fri, 27 Jul 2018 15:19:45 GMT" },
  { "name":"qa-CFB-7529", "type":"directory", "mtime":"Wed, 25 Jul 2018 21:11:54 GMT" },
]);

const flushAllPromises = () => new Promise(resolve => setImmediate(resolve));

describe('Versions Component Tests', () => {
  it('loads and displays version links', async () => {
    const wrapper = shallow(<Versions />);
    await flushAllPromises();
    wrapper.update();
    expect(wrapper.find('.version__link').length).toBe(1);
  });
});
