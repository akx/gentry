import React, { ReactChild } from 'react';

const formatVar = (v) => {
  if (typeof v === 'string') {
    return v;
  }
  return JSON.stringify(v);
};
const ObjectTable: React.SFC<{
  obj: object;
  className: string;
  title?: ReactChild;
}> = ({ obj, className = '', title }) => {
  const keys = Object.keys(obj || {}).sort();
  if (!keys.length) {
    return null;
  }
  return (
    <div>
      {title || null}
      <table className={`object-table ${className}`}>
        <tbody>
          {keys.map((name) => (
            <tr key={name}>
              <th>{name}</th>
              <td>{formatVar(obj[name])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ObjectTable;
