/* eslint-env browser */
/* eslint-disable react/prop-types, jsx-a11y/href-no-hash */
import React from 'react';
import {Link} from 'react-router-dom';
import moment from 'moment';
import sortBy from 'lodash/sortBy';
import debounce from 'lodash/debounce';
import range from 'lodash/range';

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


export default class EventsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // From API:
      events: null,
      projects: new Map(),
      eventTypes: [],
      total: null,
      // Search parameters:
      search: '',
      type: null,
      limit: 30,
      offset: 0,
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

  searchEvents() {
    const params = new URLSearchParams();
    ['offset', 'limit', 'search', 'type', 'project'].forEach((key) => {
      const value = this.state[key];
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
      });
  }

  handleChangeProjectFilter(event) {
    const projectId = event.target.value;
    this.setState({project: projectId}, () => this.searchEvents());
  }

  handleChangeTypeFilter(event) {
    const type = event.target.value;
    this.setState({type}, () => this.searchEvents());
  }

  handleChangeOffset(offset) {
    this.setState({offset}, () => this.searchEvents());
  }

  handleChangeSearch(event) {
    const search = event.target.value;
    this.setState({search}, () => this.debouncedSearchEvents());
  }

  render() {
    const {events, projects} = this.state;
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
        <div className="flex flex-sb" style={{marginBottom: '1em'}}>
          <h1 style={{margin: 0}}>
            Events
            {this.state.total > 0 ? ` (${this.state.total})` : ''}
          </h1>
          <FilterBar
            project={this.state.project}
            projects={this.state.projects}
            eventTypes={this.state.eventTypes}
            eventType={this.state.type}
            search={this.state.search}
            offset={this.state.offset}
            limit={this.state.limit}
            total={this.state.total}
            handleChangeOffset={this.handleChangeOffset}
            handleChangeProjectFilter={this.handleChangeProjectFilter}
            handleChangeTypeFilter={this.handleChangeTypeFilter}
            handleChangeSearch={this.handleChangeSearch}
          />
        </div>
        {eventsCtr}
      </div>
    );
  }
}
