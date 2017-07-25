/* eslint-env browser */
import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import {createStore, compose} from 'redux';
import persistState from 'redux-localstorage';
import rootReducer from './reducers';

import App from './App';
import style from './style/style.less';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;  // eslint-disable-line
const enhancer = composeEnhancers(persistState(null, 'gontend'));
const store = createStore(rootReducer, enhancer);

window.addEventListener('load', () => {
  const root = document.getElementById('root');
  ReactDOM.render((
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  ), root);
});
