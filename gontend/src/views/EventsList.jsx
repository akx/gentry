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
import cx from 'classnames';

import {updateSearchParams, resetSearchParams} from '../actions';

const getEventClassName = event => ({
  'event-row': true,
  [`event-${event.type}`]: true,
  [`event-${event.level}`]: true,
  [`event-${event.type}-${event.level}`]: true,
  'event-archived': event.archived,
  'event-not-archived': !event.archived,
});

export const EventRow = ({event, project}) => (
  <div className={cx(getEventClassName(event))}>
    <Link to={`/event/${event.id}`} className="message">
      {event.message}
      {event.culprit ? <span>&nbsp;({event.culprit})</span> : null}
    </Link>
    <div className="meta">
      <span className="timestamp" title={event.timestamp}>{moment(event.timestamp).fromNow()}</span>
      <span className="project">{project ? project.name : event.project_id}</span>
    </div>
  </div>
);

const Paginator = ({offset, limit, total, handleChangeOffset}) => {
  if (total === null || total === undefined || total <= 0) return null;
  const nPages = Math.ceil(total / limit);
  const currPageZero = Math.floor(offset / limit);
  const handleChangePage = pageNo => handleChangeOffset(pageNo * limit);
  return (<span className="paginator-group">
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
  searchParams,
  projects,
  eventTypes,
  total,
  handleChange,
  handleReset,
}) => {
  const {project, type, search, offset, limit, archived} = searchParams;
  return (
    <div className="fi-ae">
      <button className="reset-search" onClick={handleReset}>&times;</button>
      <Paginator
        offset={offset}
        limit={limit}
        total={total}
        handleChangeOffset={e => handleChange('offset', e.target.value)}
      />
      <select
        value={project || ''}
        onInput={e => handleChange('project', e.target.value)}
        style={{marginRight: '1em'}}
      >
        <option value="">All projects</option>
        {
          sortBy(Array.from(projects.values()), 'name')
            .map(({id, name}) => <option key={id} value={id}>{name}</option>)
        }
      </select>
      <select
        value={type || ''}
        onInput={e => handleChange('type', e.target.value)}
        style={{marginRight: '1em'}}
      >
        <option value="">All types</option>
        {eventTypes.map(sType => <option key={sType} value={sType}>{sType}</option>)}
      </select>
      <select
        value={archived || ''}
        onInput={e => handleChange('archived', e.target.value)}
        style={{marginRight: '1em'}}
      >
        <option value="">All</option>
        <option value="true">Archived</option>
        <option value="false">Not Archived</option>
      </select>
      <input
        type="search"
        value={search}
        onInput={e => handleChange('search', e.target.value)}
        placeholder="Search..."
      />
    </div>
  );
};

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
    this.handleChange = this.handleChange.bind(this);
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

  handleChange(key, value) {
    this.props.dispatch(updateSearchParams({[key]: value}));
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
            searchParams={searchParams}
            projects={this.state.projects}
            eventTypes={this.state.eventTypes}
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
  ({searchParams}) => ({searchParams}),
  null,
  null,
  {pure: false},
)(EventsList);
