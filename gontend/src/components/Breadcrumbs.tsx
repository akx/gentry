import React from 'react';
import moment from 'moment';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import { Breadcrumbs, Crumb } from '../types/event-data';

const Crumb: React.SFC<{ crumb: Crumb }> = ({ crumb }) => (
  <tr>
    <td>{crumb.type}</td>
    <td>{crumb.level}</td>
    <td>{crumb.category}</td>
    <td>{moment.unix(crumb.timestamp).format('HH:mm:ss')}</td>
    <td className="message">{crumb.message}</td>
  </tr>
);

const BreadcrumbsView: React.SFC<{ breadcrumbs: Breadcrumbs }> = ({ breadcrumbs }) => {
  const crumbs = get(breadcrumbs, 'values');
  if (!isArray(crumbs)) {
    return null;
  }
  return (
    <div>
      <h2>Breadcrumbs</h2>
      <table className="breadcrumb-table">
        <tbody>
          {crumbs.map((crumb, i) => (
            <Crumb key={i} crumb={crumb} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BreadcrumbsView;
