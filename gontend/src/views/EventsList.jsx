/* eslint-env browser */
/* eslint-disable react/prop-types, jsx-a11y/href-no-hash */
import React from 'react';
import {Link} from 'react-router-dom';
import moment from 'moment';
import sortBy from 'lodash/sortBy';
import debounce from 'lodash/debounce';
import range from 'lodash/range';
import isEqual from 'lodash/isEqual';
import {connect} from 'react-redux';

import {updateSearchParams} from '../actions';

export const EventRow = ({event, project}) => (
  <div className={`event-row event-${event.type} event-${event.level} event-${event.type}-${event.level}`}>
    <div className="timestamp" title={event.timestamp}>{moment(event.timestamp).fromNow()}</div>
    <div className="project">{project ? project.name : event.project_id}</div>
    <Link to={`/event/${event.id}`} className="message">
      {event.message}
      {event.culprit ? <span>&nbsp;({event.culprit})</span> : null}
    </Link>
  </div>
);

const Paginator = ({offset, limit, total, handleChangeOffset}) => {
  if (total === null || total === undefined || total <= 0) return null;
  const nPages = Math.ceil(total / limit);
  const currPageZero = Math.floor(offset / limit);
  const handleChangePage = pageNo => handleChangeOffset(pageNo * limit);
  return (<span style={{marginRight: '1em'}}>
    <button
      disabled={currPageZero === 0}
      onClick={() => handleChangePage(currPageZero - 1)}
    >&larr;
    </button>
    <select
      value={currPageZero}
      onChange={e => handleChangePage(parseInt(e.target.value, 10))}
    >
      {range(0, nPages).map(pageNo => <option key={pageNo} value={pageNo}>{pageNo + 1}</option>)}
    </select>
    <button
      disabled={currPageZero === nPages - 1}
      onClick={() => handleChangePage(currPageZero + 1)}
    >
      &rarr;
    </button>
  </span>);
};

const FilterBar = ({
  project,
  projects,
  eventType,
  eventTypes,
  search,
  offset,
  limit,
  total,
  handleChangeOffset = null,
  handleChangeProjectFilter = null,
  handleChangeTypeFilter = null,
  handleChangeSearch = null,
}) => (
  <div className="fi-ae">
    <Paginator offset={offset} limit={limit} total={total} handleChangeOffset={handleChangeOffset} />
    <select
      value={project}
      onInput={handleChangeProjectFilter}
      style={{marginRight: '1em'}}
    >
      <option value="">All projects</option>
      {
        sortBy(Array.from(projects.values()), 'name')
          .map(({id, name}) => <option key={id} value={id}>{name}</option>)
      }
    </select>
    <select
      value={eventType || ''}
      onInput={handleChangeTypeFilter}
      style={{marginRight: '1em'}}
    >
      <option value="">All types</option>
      {eventTypes.map(sType => <option key={sType} value={sType}>{sType}</option>)}
    </select>
    <input type="search" value={search} onInput={handleChangeSearch} placeholder="Search..." />
  </div>
);

class EventsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // From API:
      events: null,
      projects: new Map(),
      eventTypes: [],
      total: null,
    };
    this.handleChangeProjectFilter = this.handleChangeProjectFilter.bind(this);
    this.handleChangeTypeFilter = this.handleChangeTypeFilter.bind(this);
    this.handleChangeSearch = this.handleChangeSearch.bind(this);
    this.handleChangeOffset = this.handleChangeOffset.bind(this);
    this.debouncedSearchEvents = debounce(this.searchEvents, 500);
  }

  componentDidMount() {
    fetch('/api/projects/', {
      credentials: 'same-origin',
    })
      .then(r => r.json())
      .then((projects) => {
        this.setState({projects: new Map(projects.map(p => [p.id, p]))});
      });
    fetch('/api/event-types/')
      .then(r => r.json())
      .then((eventTypes) => {
        this.setState({eventTypes});
      });

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
    const {searchParams} = this.props;

    Object.keys(searchParams).forEach((key) => {
      const value = searchParams[key];
      if (value !== null && value !== '' && value !== undefined) {
        params.append(key, value);
      }
    });
    fetch(
      `/api/events/?${params.toString()}`,
      {credentials: 'same-origin'},
    )
      .then(r => r.json())
      .then(({events, total, offset, limit}) => {
        this.setState({total, events, offset, limit});
        this.props.dispatch(updateSearchParams({offset, limit}));
      });
  }

  handleChangeProjectFilter(event) {
    const project = event.target.value;
    this.props.dispatch(updateSearchParams({project}));
  }

  handleChangeTypeFilter(event) {
    const type = event.target.value;
    this.props.dispatch(updateSearchParams({type}));
  }

  handleChangeOffset(offset) {
    this.props.dispatch(updateSearchParams({offset}));
  }

  handleChangeSearch(event) {
    const search = event.target.value;
    this.props.dispatch(updateSearchParams({search}));
  }

  render() {
    const {events, projects} = this.state;
    const {searchParams} = this.props;
    let eventsCtr = null;
    if (events === null) {
      eventsCtr = <div>Loading, hold on...</div>;
    } else if (events.length === 0) {
      eventsCtr = <div>No events – maybe there are none or your filters exclude all of them.</div>;
    } else {
      eventsCtr = (<div>
        {events.map(event => <EventRow key={event.id} event={event} project={projects.get(event.project_id)} />)}
      </div>);
    }
    return (
      <div className="EventsList-view">
        <nav className="top flex flex-sb">
          <h1>
            Events
            {this.state.total > 0 ? ` (${this.state.total})` : ''}
          </h1>
          <FilterBar
            project={searchParams.project}
            search={searchParams.search}
            offset={searchParams.offset}
            limit={searchParams.limit}
            eventType={searchParams.type}
            projects={this.state.projects}
            eventTypes={this.state.eventTypes}
            total={this.state.total}
            handleChangeOffset={this.handleChangeOffset}
            handleChangeProjectFilter={this.handleChangeProjectFilter}
            handleChangeTypeFilter={this.handleChangeTypeFilter}
            handleChangeSearch={this.handleChangeSearch}
          />
        </nav>
        <div className="content">{eventsCtr}</div>
      </div>
    );
  }
}

export default connect(
  ({searchParams}) => ({searchParams}),
  null,
  null,
  {pure: false},
)(EventsList);
