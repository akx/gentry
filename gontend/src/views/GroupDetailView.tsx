import React from 'react';
import { RouteComponentProps } from 'react-router';
import { GroupDetail } from '../types/api';
import fetchJSON from '../utils/fetchJSON';
import handleArchiveEvent from '../utils/handleArchiveEvent';
import EventRow from '../components/EventRow';
import { AppThunkDispatch } from '../types/state';
import { connect } from 'react-redux';
import { archiveGroup } from '../actions';
import ArchiveButton from '../components/ArchiveButton';

interface GroupDetailState {
  group?: GroupDetail;
}

interface GroupDetailProps extends RouteComponentProps<any> {
  dispatch: AppThunkDispatch;
}

class GroupDetailView extends React.Component<GroupDetailProps, GroupDetailState> {
  public state: GroupDetailState = {
    group: undefined,
  };

  public componentDidMount() {
    const { id } = this.props.match.params;
    fetchJSON<GroupDetail>(`/api/group/${id}`).then((group) => {
      this.setState({ group });
    });
  }

  private handleArchiveEvent = (eventId) => {
    const group = this.state.group!;
    const events = group.events;
    const newEvents = handleArchiveEvent(this.props.dispatch, events, eventId);
    this.setState({ group: { ...group, events } });
  };

  private handleArchiveGroup = () => {
    const group = this.state.group!;
    this.props.dispatch(archiveGroup(group.id));
    this.setState({ group: { ...group, archived: true } });
  };

  public render() {
    const { group } = this.state;
    if (!group) {
      return <div>Loading...</div>;
    }
    const { project } = group;
    const event0 = group.events[0]!;
    const groupClassSpec = `event-${event0.type} event-${event0.level} event-${event0.type}-${event0.level}`;
    return (
      <div className={`GroupDetail-view ${groupClassSpec}`}>
        <nav className={`top ${groupClassSpec}`}>
          <h1>
            {project ? project.name : group.project_id} / Group {group.id} &ndash; {group.n_events} events
          </h1>
          <div className="actions">{!group.archived ? <ArchiveButton onClick={this.handleArchiveGroup} /> : null}</div>
        </nav>
        <div className="GroupDetail-inner">
          <div className="events-table s-table">
            {group.events.map((event) => (
              <EventRow key={event.id} event={event} project={project} onArchiveEvent={this.handleArchiveEvent} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default connect()(GroupDetailView);
