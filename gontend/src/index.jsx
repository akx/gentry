/* eslint-env browser */
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';

import App from './App';
import style from './style/style.less';

window.addEventListener('load', () => {
  const root = document.getElementById('root');
  ReactDOM.render(<HashRouter><App /></HashRouter>, root);
});
