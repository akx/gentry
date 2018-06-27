import React from 'react';
import Stacktrace from './Stacktrace';
import {Exception, ExceptionValue} from '../types/event-data';


const EventSingleExceptionInfo: React.SFC<{ exc: ExceptionValue }> = ({exc}) => (
  <div>
    <h2>
      {exc.type}
      : {exc.value}
    </h2>
    <Stacktrace stacktrace={exc.stacktrace} />
    <hr />
  </div>
);

const EventExceptionInfo: React.SFC<{ exceptionData: Exception }> = ({exceptionData}) => (
  <div>{exceptionData.values.map((exc, i) => <EventSingleExceptionInfo exc={exc} key={i} />)}</div>
);

export default EventExceptionInfo;
