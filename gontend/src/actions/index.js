/* eslint-env browser */
export const updateSearchParams = (values) => ({ type: 'updateSearchParams', payload: values });
export const resetSearchParams = () => ({ type: 'resetSearchParams' });
export const archiveEvent = (eventId) => (dispatch) => {
  dispatch({ type: 'archiveEventStart', payload: { eventId } });
  fetch(`/api/event/${eventId}/archive/`, { method: 'POST', credentials: 'same-origin' })
    .then((r) => r.json())
    .then(() => {
      dispatch({ type: 'archiveEvent', payload: { eventId } });
    });
};
export const updateMetadata = () => (dispatch) => {
  const projectsPromise = fetch('/api/projects/', {
    credentials: 'same-origin',
  }).then((r) => r.json());
  const eventTypesPromise = fetch('/api/event-types/', {
    credentials: 'same-origin',
  }).then((r) => r.json());
  return Promise.all([projectsPromise, eventTypesPromise]).then(([projects, eventTypes]) => {
    dispatch({ type: 'receiveMetadata', payload: { projects, eventTypes } });
  });
};
