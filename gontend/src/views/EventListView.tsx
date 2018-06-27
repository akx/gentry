import React from 'react';
import {EventsResponse, Project} from '../types/api';
import {connectListView, ListView} from './ListView';
import {archiveEvent} from '../actions';
import EventRow from '../components/EventRow';
import update from 'immutability-helper';
import fetchJSON from '../utils/fetchJSON';

class EventListView extends ListView<EventsResponse> {
  protected getData(params: URLSearchParams): Promise<EventsResponse> {
    return fetchJSON<EventsResponse>(`/api/events/?${params.toString()}`);
  }

  private handleArchiveEvent = (eventId) => {
    this.props.dispatch(archiveEvent(eventId));
    // Pre-emptively set the event to be archived even if the request possibly failed.
    const response = this.state.response!;
    const events = response.events.map((e) => {
      if (e.id === eventId) {
        return update(e, {archived: {$set: true}});
      }
      return e;
    });
    this.setState({response: {...response, events}});
  };

  protected getTitle(): string {
    return 'Events';
  }

  protected renderContent(): React.ReactChild {
    const {projects} = this.props;
    const {response} = this.state;
    if (!response) {
      return <div>Loading...</div>;
    }
    const {events} = response;
    if (events.length === 0) {
      return <div>No events – maybe there are none or your filters exclude all of them.</div>;
    }
    const projectsMap = new Map(projects.map<[number, Project]>((p) => [p.id, p]));
    return (
      <div className="events-table s-table">
        {events.map((event) => (
          <EventRow
            key={event.id}
            event={event}
            project={projectsMap.get(event.project_id)}
            onArchiveEvent={this.handleArchiveEvent}
          />
        ))}
      </div>
    );
  }

}

export default connectListView(EventListView);
