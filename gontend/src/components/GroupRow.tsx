import React, {CSSProperties} from 'react';
import {Link} from 'react-router-dom';
import cx from 'classnames';
import {Group, Project} from '../types/api';
import generateGradient from '../utils/generateGradient';
import getRowClassName from '../utils/getRowClassName';
import ArchiveButton from './ArchiveButton';
import Timestamp from './Timestamp';

interface GroupRowProps {
  group: Group;
  project?: Project;
  onArchiveGroup: any;
  maxNEvents: number;
}

let severityGradient: string[];

function getSeverityCSS(nEvents: number, maxNEvents: number): CSSProperties {
  if (nEvents <= 1 || maxNEvents === 1) {
    return {};
  }
  const i = nEvents / maxNEvents;
  if (!severityGradient) {
    severityGradient = generateGradient(['#000', '#d80', '#f00'], 32);
  }
  const index = Math.floor(i * (severityGradient.length - 1));
  return {
    color: severityGradient[index],
  };
}

const GroupRow: React.SFC<GroupRowProps> = ({group, project, onArchiveGroup, maxNEvents}) => {
  const event = group.first_event!;

  return (
    <div className={cx(getRowClassName(event, group.archived))}>
      <span className="occurrences" style={getSeverityCSS(group.n_events, maxNEvents)}>
          {group.n_events}
      </span>
      <Link to={`/group/${group.id}`} className="message">
        {event.message}
        {event.culprit ? <span>&nbsp;({event.culprit})</span> : null}
      </Link>
      <div className="meta">
        <Timestamp start={group.first_event_time} end={group.last_event_time}/>
        <span className="project">{project ? project.name : event.project_id}</span>
      </div>
      <div className="actions">
        {!group.archived ? <ArchiveButton onClick={() => onArchiveGroup(group.id)}/> : null}
      </div>
    </div>
  );
};
export default GroupRow;
