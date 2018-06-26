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

      <div className="actions">
        {!group.archived ? (
          <button type="button" onClick={() => onArchiveGroup(group.id)}>
            <img src={ArchiveButton} alt="Archive" />
          </button>
        ) : null}
      </div>
      <div className="meta">
        <span className="timestamp">
          <time dateTime={group.first_event_time}>{moment(group.first_event_time).fromNow()}</time>
          ..
          <time dateTime={group.last_event_time}>{moment(group.last_event_time).fromNow()}</time>
        </span>
        <span className="project">{project ? project.name : event.project_id}</span>
      </div>
    </div>
  );
};
export default GroupRow;
