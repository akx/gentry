import React from 'react';
import sortBy from 'lodash/sortBy';
import Paginator from './Paginator';

const FilterBar = ({searchParams, projects, eventTypes, total, handleChange, handleReset}) => {
  const {project, type, search, offset, limit, archived} = searchParams;
  return (
    <div className="fi-ae">
      <button type="button" className="reset-search" onClick={handleReset}>
        &times;
      </button>
      <Paginator
        offset={offset}
        limit={limit}
        total={total}
        handleChangeOffset={(newOffset) => handleChange('offset', newOffset)}
      />
      <select
        value={project || ''}
        onChange={(e) => handleChange('project', (e.target as HTMLSelectElement).value)}
        style={{marginRight: '1em'}}
      >
        <option value="">All projects</option>
        {sortBy(projects, 'name').map(({id, name}) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
      <select
        value={type || ''}
        onInput={(e) => handleChange('type', (e.target as HTMLSelectElement).value)}
        style={{marginRight: '1em'}}
      >
        <option value="">All types</option>
        {eventTypes.map((sType) => (
          <option key={sType} value={sType}>
            {sType}
          </option>
        ))}
      </select>
      <select
        value={archived || ''}
        onInput={(e) => handleChange('archived', (e.target as HTMLSelectElement).value)}
        style={{marginRight: '1em'}}
      >
        <option value="">All</option>
        <option value="true">Archived</option>
        <option value="false">Not Archived</option>
      </select>
      <input
        type="search"
        value={search}
        onInput={(e) => handleChange('search', (e.target as HTMLInputElement).value)}
        placeholder="Search..."
      />
    </div>
  );
};
export default FilterBar;
