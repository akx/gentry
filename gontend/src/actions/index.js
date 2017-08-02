/* eslint-env browser */
export const updateSearchParams = values => ({type: 'updateSearchParams', payload: values});
export const resetSearchParams = () => ({type: 'resetSearchParams'});
export const archiveEvent = eventId => (dispatch) => {
  dispatch({type: 'archiveEventStart', payload: {eventId}});
  fetch(`/api/event/${eventId}/archive/`, {method: 'POST', credentials: 'same-origin'})
    .then(r => r.json())
    .then(() => {
      dispatch({type: 'archiveEvent', payload: {eventId}});
    });
};
