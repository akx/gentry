import React from 'react';
import {GroupsResponse, Project} from '../types/api';
import {connectListView, ListView} from './ListView';
import {archiveGroup, resetSearchParams} from '../actions';
import update from 'immutability-helper';
import GroupRow from '../components/GroupRow';
import fetchJSON from '../utils/fetchJSON';
import FilterBar from '../components/FilterBar';

class GroupListView extends ListView<GroupsResponse> {
  protected getData(params: URLSearchParams): Promise<GroupsResponse> {
    return fetchJSON<GroupsResponse>(`/api/groups/?${params.toString()}`);
  }

  private handleArchiveGroup = (groupId) => {
    this.props.dispatch(archiveGroup(groupId));
    // Pre-emptively set the group to be archived even if the request possibly failed.
    const response = this.state.response!;
    const groups = response.groups.map((e) => {
      if (e.id === groupId) {
        return update(e, {archived: {$set: true}});
      }
      return e;
    });
    this.setState({response: {...response, groups}});
  };

  protected getTitle(): string {
    return 'Groups';
  }


  protected renderFilterBar(): React.ReactChild {
    const {searchParams, projects, eventTypes, dispatch} = this.props;
    const {response} = this.state;
    return (
      <FilterBar
        searchParams={searchParams}
        projects={projects}
        eventTypes={eventTypes}
        total={response ? response.total : 0}
        handleChange={this.handleChange}
        handleReset={() => this.props.dispatch(resetSearchParams())}
        showOrder
      />
    );
  }

  protected renderContent(): React.ReactChild {
    const {projects} = this.props;
    const {response} = this.state;
    if (!response) {
      return <div>Loading...</div>;
    }
    const {groups} = response;
    if (groups.length === 0) {
      return <div>No groups – maybe there are none or your filters exclude all of them.</div>;
    }
    const projectsMap = new Map(projects.map<[number, Project]>((p) => [p.id, p]));
    const maxNEvents = groups.reduce((num, g) => Math.max(num, g.n_events), 0);
    return (
      <div className="groups-table s-table">
        {groups.map((group) => (
          <GroupRow
            key={group.id}
            group={group}
            project={projectsMap.get(group.first_event.project_id)}
            onArchiveGroup={this.handleArchiveGroup}
            maxNEvents={maxNEvents}
          />
        ))}
      </div>
    );
  }

}

export default connectListView(GroupListView);
