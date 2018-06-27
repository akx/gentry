import {archiveEvent} from '../actions';
import update from 'immutability-helper';

const handleArchiveEvent = (dispatch, eventList, eventId) => {
  dispatch(archiveEvent(eventId));
  // Pre-emptively set the event to be archived even if the request possibly failed.
  return eventList.map((event) => {
    if (event.id === eventId) {
      return update(event, {archived: {$set: true}});
    }
    return event;
  });
};

export default handleArchiveEvent;
