/* eslint-env browser */
/* eslint-disable react/prop-types, jsx-a11y/href-no-hash, react/prefer-stateless-function */
import React from 'react';

import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import Tophat from './images/tophat.svg';
import EventsList from './views/EventsList';
import EventDetail from './views/EventDetail';
import { updateMetadata } from './actions';

class App extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(updateMetadata());
  }

  render() {
    return (
      <div className="main-container">
        <nav className="main">
          <Link to="/">
            <img alt="Logo" src={Tophat} />
          </Link>
        </nav>
        <main>
          <Route path="/event/:id" component={EventDetail} />
          <Route path="/" exact component={EventsList} />
        </main>
      </div>
    );
  }
}

export default connect(null, null, null, {pure: false})(App);
