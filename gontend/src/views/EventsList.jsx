/* eslint-env browser */
/* eslint-disable react/no-unused-state */
import React from 'react';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import { connect } from 'react-redux';
import update from 'immutability-helper';

import { archiveEvent, resetSearchParams, updateSearchParams } from '../actions';
import EventRow from '../components/EventRow';
import FilterBar from '../components/FilterBar';


class EventsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // From API:
      events: null,
      total: null,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleArchive = this.handleArchive.bind(this);
    this.debouncedSearchEvents = debounce(this.searchEvents, 500);
  }

  componentDidMount() {
    this.searchEvents();
    this.refreshInterval = setInterval(() => this.searchEvents(), 10000);
  }

  componentWillUnmount() {
    clearInterval(this.refreshInterval);
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.searchParams, prevProps.searchParams)) {
      // Search parameters were updated, so a search is required
      this.searchEvents();
    }
  }

  searchEvents() {
    const params = new URLSearchParams();
    const { searchParams } = this.props;

    Object.keys(searchParams).forEach((key) => {
      const value = searchParams[key];
      if (value !== null && value !== '' && value !== undefined) {
        params.append(key, value);
      }
    });
    fetch(`/api/events/?${params.toString()}`, { credentials: 'same-origin' })
      .then((r) => r.json())
      .then(({
        events, total, offset, limit,
      }) => {
        this.setState({
          total,
          events,
          offset,
          limit,
        });
        this.props.dispatch(updateSearchParams({ offset, limit }));
      });
  }

  handleChange(key, value) {
    this.props.dispatch(updateSearchParams({ [key]: value }));
  }

  handleArchive(eventId) {
    this.props.dispatch(archiveEvent(eventId));

    // Pre-emptively set the event to be archived even if the request possibly failed.
    // eslint-disable-next-line react/no-access-state-in-setstate
    const events = this.state.events.map((e) => {
      if (e.id === eventId) {
        return update(e, { archived: { $set: true } });
      }
      return e;
    });
    this.setState({ events });
  }

  render() {
    const { events } = this.state;
    const { searchParams, projects, eventTypes } = this.props;
    let eventsCtr = null;
    if (events === null) {
      eventsCtr = <div>Loading, hold on...</div>;
    } else if (events.length === 0) {
      eventsCtr = <div>No events – maybe there are none or your filters exclude all of them.</div>;
    } else {
      const projectsMap = new Map(projects.map((p) => [p.id, p]));
      eventsCtr = (
        <div>
          {events.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              project={projectsMap.get(event.project_id)}
              onArchiveEvent={this.handleArchive}
            />
          ))}
        </div>
      );
    }
    return (
      <div className="EventsList-view">
        <nav className="top flex flex-sb">
          <h1>
            Events
            {this.state.total > 0 ? ` (${this.state.total})` : ''}
          </h1>
          <FilterBar
            searchParams={searchParams}
            projects={projects}
            eventTypes={eventTypes}
            total={this.state.total}
            handleChange={this.handleChange}
            handleReset={() => this.props.dispatch(resetSearchParams())}
          />
        </nav>
        <div className="content">{eventsCtr}</div>
      </div>
    );
  }
}

export default connect(
  ({ searchParams, metadata }) => {
    console.log(searchParams, metadata);
    return ({
      searchParams,
      projects: metadata.projects,
      eventTypes: metadata.eventTypes,
    });
  },
  null,
  null,
  { pure: false },
)(EventsList);
