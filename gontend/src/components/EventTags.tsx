import React from 'react';
import get from 'lodash/get';
import map from 'lodash/map';
import { EventDetail } from '../types/api';

const EventTags: React.SFC<{ event: EventDetail }> = ({ event }) => (
  <div className="event-tags">
    {map(get(event, 'data.tags') || {}, (value, key) => (
      <span className="event-tag" key={key}>
        {key}: <b>{`${value}`}</b>
      </span>
    ))}
  </div>
);

export default EventTags;
