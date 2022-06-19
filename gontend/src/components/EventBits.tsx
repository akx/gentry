import React from 'react';
import { EventDetail } from '../types/api';
import moment from 'moment';
import get from 'lodash/get';

const bitDefs: Array<{ title: string; value: (e: EventDetail) => any }> = [
  {
    title: 'Received',
    value: (event) => <span title={event.timestamp}>{moment(event.timestamp).fromNow()}</span>,
  },
  { title: 'Message', value: (event) => get(event, 'data.message') },
  { title: 'Culprit', value: (event) => get(event, 'data.culprit') },
  { title: 'Level', value: (event) => get(event, 'data.level') },
  { title: 'Server', value: (event) => get(event, 'data.server_name') },
  { title: 'Release', value: (event) => get(event, 'data.release') },
  { title: 'Platform', value: (event) => get(event, 'data.platform') },
  { title: 'User ID', value: (event) => get(event, 'data.user.id') },
  { title: 'User Name', value: (event) => get(event, 'data.user.username') },
  { title: 'Event ID', value: (event) => get(event, 'data.event_id') },
  { title: 'Time Spent', value: (event) => get(event, 'data.time_spent') },
];
const EventBits: React.SFC<{ event: EventDetail }> = ({ event }) => (
  <table className="event-bits-table">
    <tbody>
      {bitDefs.map(({ title, value }) => {
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
          console.warn(e); // tslint:disable-line
        }
        return null;
      })}
    </tbody>
  </table>
);

export default EventBits;
