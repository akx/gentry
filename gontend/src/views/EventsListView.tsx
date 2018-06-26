import React from 'react';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import {connect} from 'react-redux';
import update from 'immutability-helper';
import {archiveEvent, resetSearchParams, updateSearchParams} from '../actions';
import EventRow from '../components/EventRow';
import FilterBar from '../components/FilterBar';
import {AppThunkDispatch, SearchParams, State} from '../types/state';
import {Event, EventsResponse, Project} from '../types/api';
import {fetchJSON} from '../utils';

interface EventsListState {
  total: number;
  events: Event[];
  offset: number;
  limit: number;
}

interface EventsListProps {
  dispatch: AppThunkDispatch;
  searchParams: SearchParams;
  projects: Project[];
  eventTypes: string[];
}

class EventsListView extends React.Component<EventsListProps, EventsListState> {
  public state: EventsListState = {
    events: [],
    total: 0,
    offset: 0,
    limit: 0,
  };
  private debouncedSearchEvents = debounce(this.searchEvents, 500);
  private refreshInterval?: number;

  public componentDidMount() {
    this.searchEvents();
    this.refreshInterval = window.setInterval(() => this.searchEvents(), 10000);
  }

  public componentWillUnmount() {
    clearInterval(this.refreshInterval);
  }

  public componentDidUpdate(prevProps) {
    if (!isEqual(this.props.searchParams, prevProps.searchParams)) {
      // Search parameters were updated, so a search is required
      this.searchEvents();
    }
  }

  public searchEvents() {
    const params = new URLSearchParams();
    const {searchParams} = this.props;
    Object.keys(searchParams).forEach((key) => {
      const value = searchParams[key];
      if (value !== null && value !== '' && value !== undefined) {
        params.append(key, value);
      }
    });
    fetchJSON<EventsResponse>(`/api/events/?${params.toString()}`)
      .then(({events, total, offset, limit}) => {
        this.setState({
          total,
          events,
          offset,
          limit,
        });
        this.props.dispatch(updateSearchParams({offset, limit}));
      });
  }

  public handleChange = (key, value) => {
    this.props.dispatch(updateSearchParams({[key]: value}));
  };

  public handleArchive = (eventId) => {
    this.props.dispatch(archiveEvent(eventId));
    // Pre-emptively set the event to be archived even if the request possibly failed.
    const events = this.state.events.map((e) => {
      if (e.id === eventId) {
        return update(e, {archived: {$set: true}});
      }
      return e;
    });
    this.setState({events});
  };

  private renderEventsCtr(events: Event[], projects: Project[]) {
    if (events === null) {
      return <div>Loading, hold on...</div>;
    } else if (events.length === 0) {
      return <div>No events – maybe there are none or your filters exclude all of them.</div>;
    } else {
      const projectsMap = new Map(projects.map<[number, Project]>((p) => [p.id, p]));
      return (
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
  }

  public render() {
    const {events} = this.state;
    const {searchParams, projects, eventTypes} = this.props;
    const eventsCtr = this.renderEventsCtr(events, projects);
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
  ({searchParams, metadata}: State) => {
    return {
      searchParams,
      projects: metadata.projects,
      eventTypes: metadata.eventTypes,
    };
  },
  null,
  null,
  {pure: false},
)(EventsListView);
