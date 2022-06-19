import React from 'react';
import { EventsResponse, Project } from '../types/api';
import { connectListView, ListView } from './ListView';
import EventRow from '../components/EventRow';
import fetchJSON from '../utils/fetchJSON';
import handleArchiveEvent from '../utils/handleArchiveEvent';

class EventListView extends ListView<EventsResponse> {
  protected getData(params: URLSearchParams): Promise<EventsResponse> {
    return fetchJSON<EventsResponse>(`/api/events/?${params.toString()}`);
  }

  private handleArchiveEvent = (eventId) => {
    const response = this.state.response!;
    const events = response.events;
    const newEvents = handleArchiveEvent(this.props.dispatch, events, eventId);
    this.setState({ response: { ...response, events } });
  };

  protected getTitle(): string {
    return 'Events';
  }

  protected renderContent(): React.ReactChild {
    const { projects } = this.props;
    const { response } = this.state;
    if (!response) {
      return <div>Loading...</div>;
    }
    const { events } = response;
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
