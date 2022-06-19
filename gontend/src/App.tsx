import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import EventDetailView from './views/EventDetailView';
import EventListView from './views/EventListView';
import GroupDetailView from './views/GroupDetailView';
import GroupListView from './views/GroupListView';
import NotFoundView from './views/NotFoundView';
import MainNav from './components/MainNav';

import { AppThunkDispatch } from './types/state';
import { updateMetadata } from './actions';

interface AppProps {
  dispatch: AppThunkDispatch;
}

class App extends React.Component<AppProps, {}> {
  public componentDidMount() {
    const { dispatch } = this.props;
    dispatch(updateMetadata());
  }

  public render() {
    return (
      <React.Fragment>
        <MainNav />
        <Switch>
          <Route path="/event/:id" component={EventDetailView} />
          <Route path="/events" exact component={EventListView} />
          <Route path="/group/:id" component={GroupDetailView} />
          <Route path="/groups" exact component={GroupListView} />
          <Redirect path="/" to="/groups" exact />
          <Route component={NotFoundView} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default connect(null, null, null, { pure: false })(App);
