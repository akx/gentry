/* eslint-env browser */
/* eslint-disable react/prop-types, jsx-a11y/href-no-hash */
import React from 'react';
import {Link} from 'react-router-dom';
import moment from 'moment';

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


export default class EventsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      projects: new Map(),
    };
  }

  componentDidMount() {
    fetch('/api/events/', {
      credentials: 'same-origin',
    }).then(r => r.json()).then((events) => {
      this.setState({events});
    });
    fetch('/api/projects/', {
      credentials: 'same-origin',
    }).then(r => r.json()).then((projects) => {
      this.setState({projects: new Map(projects.map(p => [p.id, p]))});
    });
  }

  render() {
    const {events, projects} = this.state;
    return (
      <div className="EventsList-view">
        <h1>Events</h1>
        {events.map(event => <EventRow key={event.id} event={event} project={projects.get(event.project_id)} />)}
      </div>
    );
  }
}
