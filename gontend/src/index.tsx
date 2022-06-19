import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import persistState from 'redux-localstorage';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import App from './App';
import './style/style.less';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancer = composeEnhancers(applyMiddleware(thunk), persistState(null, 'gontend'));
const store = createStore(rootReducer, enhancer);
window.addEventListener('load', () => {
  const root = document.getElementById('root');
  ReactDOM.render(
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>,
    root,
  );
});
