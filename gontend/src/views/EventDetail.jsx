/* eslint-env browser */
/* eslint-disable react/prop-types, jsx-a11y/href-no-hash, react/no-array-index-key */
import React from 'react';
import moment from 'moment';
import get from 'lodash/get';
import map from 'lodash/map';
import isString from 'lodash/isString';
import {Tabs} from '../components/Taboo';


const bitDefs = [
  {title: 'Received', value: event => <span title={event.timestamp}>{moment(event.timestamp).fromNow()}</span>},
  {title: 'Message', value: event => get(event, 'data.message')},
  {title: 'Culprit', value: event => get(event, 'data.culprit')},
  {title: 'Level', value: event => get(event, 'data.level')},
  {title: 'Server', value: event => get(event, 'data.server_name')},
  {title: 'Release', value: event => get(event, 'data.release')},
  {title: 'Platform', value: event => get(event, 'data.platform')},
  {title: 'User ID', value: event => get(event, 'data.user.id')},
  {title: 'User Name', value: event => get(event, 'data.user.username')},
  {title: 'Event ID', value: event => get(event, 'data.event_id')},
  {title: 'Time Spent', value: event => get(event, 'data.time_spent')},
];

const EventBits = ({event}) => (
  <table className="event-bits-table">
    <tbody>
      {bitDefs.map(({title, value}) => {
        try {
          const computedValue = value(event);
          if (computedValue !== null) {
            return (
              <tr key={title}>
                <td>{title}</td>
                <td>{computedValue}</td>
              </tr>
            );
          }
        } catch (e) {
          console.warn(e);
        }
        return null;
      })}
    </tbody>
  </table>
);

const EventTags = ({event}) => (<div className="event-tags">
  {map(
    get(event, 'data.tags') || {},
    (value, key) => (<span className="event-tag" key={key}>{key}: <b>{`${value}`}</b></span>),
  )}
</div>);

const formatVar = (v) => {
  if (isString(v)) return v;
  return JSON.stringify(v);
};

const ObjectTable = ({obj, className = '', title = null}) => {
  const keys = Object.keys(obj || {}).sort();
  if (!keys.length) return null;
  return (
    <div>
      {title}
      <table className={`object-table ${className}`}>
        <tbody>
          {
            keys.map(
              name => (
                <tr key={name}>
                  <th>{name}</th>
                  <td>{formatVar(obj[name])}</td>
                </tr>
              ),
            )
          }
        </tbody>
      </table>
    </div>
  );
};

const ExceptionStacktrace = ({exc, stacktrace}) => {
  if (!stacktrace) return null;
  const frames = (stacktrace.frames || []);
  if (!frames.length) return null;
  return (<div>
    <h3>Stacktrace</h3>
    <table className="stacktrace-table">
      <tbody>
        {frames.map((frame, frameIndex) => (
          <tr key={frameIndex} className="stacktrace-frame">
            <td className="stacktrace-code">
              {(frame.pre_context || []).map((l, i) => <div className="pre" key={`pre-${i}`}>{l}</div>)}
              {frame.context_line ? <div>{frame.context_line}</div> : null}
              {(frame.post_context || []).map((l, i) => <div className="pre" key={`post-${i}`}>{l}</div>)}
            </td>
            <td>
              <h2>{frame.filename}:{frame.lineno} (<b>{frame.function}</b>)</h2>
              <ObjectTable className="stacktrace-vars" obj={frame.vars} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>);
};

const EventSingleExceptionInfo = ({event, exc}) => (
  <div>
    <h2>{exc.type}: {exc.value}</h2>
    <ExceptionStacktrace exc={exc} stacktrace={exc.stacktrace} />
    <hr />
  </div>
);

const EventExceptionInfo = ({event, exceptionData}) => (<div>
  {exceptionData.values.map((exc, i) => <EventSingleExceptionInfo event={event} exc={exc} key={i} />)}
</div>);


const EventRequestInfo = ({event, requestData}) => (
  <div>
    <h2>{requestData.method} <a href={requestData.url}>{requestData.url}</a></h2>
    <ObjectTable className="request-cookies" obj={requestData.cookies || {}} title={<h3>Cookies</h3>} />
    <ObjectTable className="request-headers" obj={requestData.headers || {}} title={<h3>Headers</h3>} />
    <ObjectTable className="request-env" obj={requestData.env || {}} title={<h3>Env</h3>} />
  </div>
);


export default class EventDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: null,
    };
  }

  componentDidMount() {
    const id = this.props.match.params.id;
    fetch(`/api/event/${id}`, {
      credentials: 'same-origin',
    }).then(r => r.json()).then((event) => {
      this.setState({event});
    });
  }


  render() {
    const {event} = this.state;
    if (!event) {
      return <div>Loading...</div>;
    }
    const {project, data} = event;
    const eventClassSpec = `event-${event.type} event-${event.level} event-${event.type}-${event.level}`;
    return (
      <div className={`EventDetail-view ${eventClassSpec}`}>
        <nav className={`top ${eventClassSpec}`}>
          <h1>{project ? project.name : event.project_id} / Event {event.id} &ndash; {event.message}</h1>
        </nav>
        <div className="EventDetail-inner">
          <Tabs
            tabs={[
              {id: 'general', title: 'General'},
              {id: 'exception', title: 'Exception', visible: !!data.exception},
              {id: 'request', title: 'Request', visible: !!data.request},
              {id: 'raw', title: 'Raw Data'},
            ]}
          >
            <div id="general">
              <EventBits event={event} />
              <h2>Tags</h2>
              <EventTags event={event} />
            </div>
            <div id="exception">
              {data.exception ? <EventExceptionInfo event={event} exceptionData={data.exception} /> : null}
            </div>
            <div id="request">
              {data.request ? <EventRequestInfo event={event} requestData={data.request} /> : null }
            </div>
            <div id="raw">
              <div style={{maxWidth: '90vw', maxHeight: '80vh', overflow: 'auto'}}>
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    );
  }
}
