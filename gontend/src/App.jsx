/* eslint-env browser */
/* eslint-disable react/prop-types, jsx-a11y/href-no-hash */
import React from 'react';
import {Route, Link} from 'react-router-dom';
import Tophat from './images/tophat.svg';
import EventsList from './views/EventsList';
import EventDetail from './views/EventDetail';


export default class App extends React.Component {
  render() {
    return (
      <div className="main-container">
        <nav className="main">
          <Link to="/"><img alt="Logo" src={Tophat} /></Link>
        </nav>
        <main>
          <Route path="/event/:id" component={EventDetail} />
          <Route path="/" exact component={EventsList} />
        </main>
      </div>
    );
  }
}
