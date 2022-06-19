import React from 'react';
import { Tabs } from '../components/Taboo';
import { RouteComponentProps } from 'react-router';
import { EventDetail } from '../types/api';
import Breadcrumbs from '../components/Breadcrumbs';
import EventBits from '../components/EventBits';
import EventExceptionInfo from '../components/EventExceptionInfo';
import EventRequestInfo from '../components/EventRequestInfo';
import EventTags from '../components/EventTags';
import Stacktrace from '../components/Stacktrace';
import RawDataContainer from '../components/RawDataContainer';
import fetchJSON from '../utils/fetchJSON';
import GroupButton from '../components/GroupButton';

interface EventDetailState {
  event?: EventDetail;
}

interface EventDetailProps extends RouteComponentProps<any> {}

export default class EventDetailView extends React.Component<EventDetailProps, EventDetailState> {
  public state: EventDetailState = {
    event: undefined,
  };

  public componentDidMount() {
    const { id } = this.props.match.params;
    fetchJSON<EventDetail>(`/api/event/${id}`).then((event) => {
      this.setState({ event });
    });
  }

  public render() {
    const { event } = this.state;
    if (!event) {
      return <div>Loading...</div>;
    }
    const { project, data } = event;
    if (!data) {
      return (
        <div>
          Error: Event has no detail data.
          <div style={{ maxWidth: '90vw', maxHeight: '80vh', overflow: 'auto' }}>
            <pre>{JSON.stringify(event, null, 2)}</pre>
          </div>
        </div>
      );
    }
    const eventClassSpec = `event-${event.type} event-${event.level} event-${event.type}-${event.level}`;
    return (
      <div className={`EventDetail-view ${eventClassSpec}`}>
        <nav className={`top ${eventClassSpec}`}>
          <h1>
            {project ? project.name : event.project_id} / Event {event.id} &ndash; {event.message}
          </h1>
          <div className="actions">
            {event.group && event.group.n_events > 1 ? (
              <GroupButton onClick={() => this.props.history.push(`/group/${event.group!.id}`)} />
            ) : null}
          </div>
        </nav>
        <div className="EventDetail-inner">
          <Tabs
            tabs={[
              { id: 'general', title: 'General' },
              { id: 'breadcrumbs', title: 'Breadcrumbs', visible: !!data.breadcrumbs },
              { id: 'exception', title: 'Exception', visible: !!data.exception },
              { id: 'stacktrace', title: 'Stacktrace', visible: !!data.stacktrace },
              { id: 'request', title: 'Request', visible: !!data.request },
              { id: 'raw', title: 'Raw Data' },
            ]}
          >
            <div id="general">
              <div className="flex">
                <div>
                  <h2>General</h2>
                  <EventBits event={event} />
                  <br />
                  <EventTags event={event} />
                </div>
                <div className="fi1 ml">
                  <h2>Group</h2>
                  TODO {/* TODO: add group info here */}
                </div>
              </div>
            </div>
            <div id="breadcrumbs">{data.breadcrumbs ? <Breadcrumbs breadcrumbs={data.breadcrumbs} /> : null}</div>
            <div id="exception">{data.exception ? <EventExceptionInfo exceptionData={data.exception} /> : null}</div>
            <div id="stacktrace">{data.stacktrace ? <Stacktrace stacktrace={data.stacktrace} /> : null}</div>
            <div id="request">{data.request ? <EventRequestInfo requestData={data.request} /> : null}</div>
            <div id="raw">
              <RawDataContainer data={data} />
            </div>
          </Tabs>
        </div>
      </div>
    );
  }
}
