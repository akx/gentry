import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import cx from 'classnames';
import ArchiveButton from '../images/box-add.svg';


const getEventClassName = (event) => ({
  'event-row': true,
  [`event-${event.type}`]: true,
  [`event-${event.level}`]: true,
  [`event-${event.type}-${event.level}`]: true,
  'event-archived': event.archived,
  'event-not-archived': !event.archived,
});

const EventRow = ({ event, project, onArchiveEvent }) => (
  <div className={cx(getEventClassName(event))}>
    <Link to={`/event/${event.id}`} className="message">
      {event.message}
      {event.culprit ? <span>&nbsp;({event.culprit})</span> : null}
    </Link>
    <div className="actions">
      {!event.archived ? (
        <button type="button" onClick={() => onArchiveEvent(event.id)}>
          <img src={ArchiveButton} alt="Archive" />
        </button>
      ) : null}
    </div>
    <div className="meta">
      <span className="timestamp" title={event.timestamp}>
        {moment(event.timestamp).fromNow()}
      </span>
      <span className="project">{project ? project.name : event.project_id}</span>
    </div>
  </div>
);

export default EventRow;
