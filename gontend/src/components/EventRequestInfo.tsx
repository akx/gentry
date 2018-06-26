import React from 'react';
import {Request} from '../types/event-data';
import ObjectTable from './ObjectTable';

const EventRequestInfo: React.SFC<{ requestData: Request }> = ({requestData}) => (
  <div>
    <h2>
      {requestData.method} <a href={requestData.url}>{requestData.url}</a>
    </h2>
    <ObjectTable className="request-cookies" obj={requestData.cookies || {}} title={<h3>Cookies</h3>} />
    <ObjectTable className="request-headers" obj={requestData.headers || {}} title={<h3>Headers</h3>} />
    <ObjectTable className="request-env" obj={requestData.env || {}} title={<h3>Env</h3>} />
  </div>
);

export default EventRequestInfo;
