import React from 'react';
import range from 'lodash/range';
const Paginator = ({ offset, limit, total, handleChangeOffset }) => {
  if (total === null || total === undefined || total <= 0) { return null; }
  const nPages = Math.ceil(total / limit);
  const currPageZero = Math.floor(offset / limit);
  const handleChangePage = (pageNo) => handleChangeOffset(pageNo * limit);
  return (
    <span className="paginator-group">
      <button type="button" disabled={currPageZero === 0} onClick={() => handleChangePage(currPageZero - 1)}>
        &larr;
      </button>
      <select value={currPageZero} onChange={(e) => handleChangePage(parseInt(e.target.value, 10))}>
        {range(0, nPages).map((pageNo) => (
          <option key={pageNo} value={pageNo}>
            {pageNo + 1}
          </option>
        ))}
      </select>
      <button type="button" disabled={currPageZero === nPages - 1} onClick={() => handleChangePage(currPageZero + 1)}>
        &rarr;
      </button>
    </span>
  );
};
export default Paginator;
