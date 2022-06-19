import React from 'react';
import moment from 'moment';

const Timestamp: React.SFC<{ start: string; end?: string }> = ({ start, end }) => {
  let startText: string;
  let endText: string;
  if (start === end || !end) {
    startText = endText = moment(start).fromNow();
  } else {
    startText = moment(start).fromNow();
    endText = moment(end).fromNow();
  }
  if (startText === endText) {
    return (
      <span className="timestamp">
        <time dateTime={start}>{startText}</time>
      </span>
    );
  } else {
    return (
      <span className="timestamp timerange">
        <time dateTime={start}>{startText}</time>
        {'\u2013'}
        <time dateTime={end}>{endText}</time>
      </span>
    );
  }
};

export default Timestamp;
