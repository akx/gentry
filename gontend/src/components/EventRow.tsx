import React from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { Event, Project } from '../types/api';
import getRowClassName from '../utils/getRowClassName';
import ArchiveButton from './ArchiveButton';
import Timestamp from './Timestamp';

interface EventRowProps {
  event: Event;
  project?: Project;
  onArchiveEvent: (eventId: number) => void;
}

const EventRow: React.SFC<EventRowProps> = ({ event, project, onArchiveEvent }) => (
  <div className={cx(getRowClassName(event, event.archived))}>
    <Link to={`/event/${event.id}`} className="message">
      {event.message}
      {event.culprit ? <span>&nbsp;({event.culprit})</span> : null}
    </Link>
    <div className="meta">
      <Timestamp start={event.timestamp} />
      <span className="project">{project ? project.name : event.project_id}</span>
    </div>

    <div className="actions">{!event.archived ? <ArchiveButton onClick={() => onArchiveEvent(event.id)} /> : null}</div>
  </div>
);
export default EventRow;
