import {Action, ActionCreator, Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {State} from '../types/state';
import fetchJSON from '../utils/fetchJSON';

type GenericThunkAction = ThunkAction<void, State, void, Action>;

const doArchiveThing = (dispatch, thingType, id, url) => {
  dispatch({type: `archive${thingType}Start`, payload: {id}});
  fetchJSON(url, {method: 'POST'})
    .then(() => {
      dispatch({type: `archive${thingType}`, payload: {id}});
    });
};


export const updateSearchParams: ActionCreator<Action> = (values) => ({type: 'updateSearchParams', payload: values});

export const resetSearchParams: ActionCreator<Action> = () => ({type: 'resetSearchParams'});

export const archiveEvent: ActionCreator<GenericThunkAction> = (eventId: number) => {
  return (dispatch) => doArchiveThing(dispatch, 'Event', eventId, `/api/event/${eventId}/archive/`);
};

export const archiveGroup: ActionCreator<GenericThunkAction> = (groupId: number) => {
  return (dispatch) => doArchiveThing(dispatch, 'Group', groupId, `/api/group/${groupId}/archive/`);
};

export const updateMetadata: ActionCreator<GenericThunkAction> = () => {
  return (dispatch: Dispatch) => {
    return Promise.all([fetchJSON('/api/projects/'), fetchJSON('/api/event-types/')])
      .then(([projects, eventTypes]) => {
        dispatch({type: 'receiveMetadata', payload: {projects, eventTypes}});
      });
  };
};
