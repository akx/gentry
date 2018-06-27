import React from 'react';
import {connect} from 'react-redux';
import {Link, Redirect, Route, Switch} from 'react-router-dom';
import EventDetailView from './views/EventDetailView';
import EventListView from './views/EventListView';
import GroupListView from './views/GroupListView';
import Tophat from './images/tophat.svg';
import {AppThunkDispatch} from './types/state';
import {updateMetadata} from './actions';

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
      <React.Fragment>
        <nav className="main">
          <Link to="/">
            <img alt="Logo" src={Tophat} />
          </Link>
        </nav>
        <main>
          <Switch>
            <Route path="/event/:id" component={EventDetailView} />
            <Route path="/events" exact component={EventListView} />
            <Route path="/groups" exact component={GroupListView} />
            <Redirect path="/" to="/groups" exact />
          </Switch>
        </main>
      </React.Fragment>
    );
  }
}

export default connect(null, null, null, {pure: false})(App);
