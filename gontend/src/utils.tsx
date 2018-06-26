import {Event} from './types/api';

function fetchJSON<T = object>(url: string, options?: Partial<RequestInit>): Promise<T> {
  return (
    fetch(url, {credentials: 'same-origin', ...options})
      .then(r => r.json())
  );
}


export const getRowClassName = (event: Event, archived: boolean) => ({
  'event-row': true,
  [`r-${event.type}`]: true,
  [`r-${event.level}`]: true,
  [`r-${event.type}-${event.level}`]: true,
  'r-archived': archived,
  'r-not-archived': !archived,
});

export {fetchJSON};
