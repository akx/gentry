import React from 'react';
import {connect} from 'react-redux';
import {Link, Route} from 'react-router-dom';
import Tophat from './images/tophat.svg';
import EventListView from './views/EventListView';
import EventDetailView from './views/EventDetailView';
import {updateMetadata} from './actions';
import {AppThunkDispatch} from './types/state';

interface AppProps {
  dispatch: AppThunkDispatch;
}

class App extends React.Component<AppProps, {}> {
  public componentDidMount() {
    const {dispatch} = this.props;
    dispatch(updateMetadata());
  }

  public render() {
    return (
      <div className="main-container">
        <nav className="main">
          <Link to="/">
            <img alt="Logo" src={Tophat} />
          </Link>
        </nav>
        <main>
          <Route path="/event/:id" component={EventDetailView} />
          <Route path="/" exact component={EventListView} />
        </main>
      </div>
    );
  }
}

export default connect(null, null, null, {pure: false})(App);
