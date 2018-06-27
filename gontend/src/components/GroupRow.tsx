import React from 'react';
import {Link} from 'react-router-dom';
import moment from 'moment';
import cx from 'classnames';
import ArchiveButton from '../images/box-add.svg';
import {Group, Project} from "../types/api";
import {getRowClassName} from "../utils";

interface GroupRowProps {
  group: Group;
  project?: Project;
  onArchiveGroup: any;
}

function renderTimestamp(startTime, endTime) {
  if (startTime === endTime) {
    return (
      <span className="timestamp">
        <time dateTime={startTime}>{moment(startTime).fromNow()}</time>
      </span>
    );
  } else {
    return (
      <span className="timestamp timerange">
        <time dateTime={startTime}>{moment(startTime).fromNow()}</time>
        ..
        <time dateTime={endTime}>{moment(endTime).fromNow()}</time>
      </span>
    );
  }
}

const GroupRow: React.SFC<GroupRowProps> = ({group, project, onArchiveGroup}) => {
  const event = group.first_event!;

  return (
    <div className={cx(getRowClassName(event, group.archived))}>
      <span className="occurrences">
          {group.n_events}
      </span>
      <Link to={`/group/${group.id}`} className="message">
        {event.message}
        {event.culprit ? <span>&nbsp;({event.culprit})</span> : null}
      </Link>
      <div className="meta">
        {renderTimestamp(group.first_event_time, group.last_event_time)}
        <span className="project">{project ? project.name : event.project_id}</span>
      </div>
      <div className="actions">
        {!group.archived ? (
          <button type="button" onClick={() => onArchiveGroup(group.id)}>
            <img src={ArchiveButton} alt="Archive" />
          </button>
        ) : null}
      </div>
    </div>
  );
};
export default GroupRow;
