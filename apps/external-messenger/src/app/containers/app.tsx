import React, { Component } from 'react';
import { Route, Routes } from 'react-router-dom';

import Home from '../components/Home';
import Masthead from '../components/Masthead';
import Versions from '../containers/Versions';
import Thread from './Thread';
import './app.scss';

import 'url-search-params-polyfill';

const AppWrap = (props) => (
  <>
    <Masthead className="app__sidebar" />
    <main className="app__main">
      <Thread />
    </main>
  </>
);

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/version/:version/:user_thread_external_id"
        element={<AppWrap />}
      />
      <Route path="/version/:version/" element={<Home />} />
      <Route path="/qa/versions/" element={<Versions />} />
      <Route path="/:user_thread_external_id" element={<AppWrap />} />
      <Route element={<Home />} />
    </Routes>
  );
};

export default App;

