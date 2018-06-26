import {fetchJSON} from '../utils';
import {Action, ActionCreator, Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {State} from '../types/state';

type GenericThunkAction = ThunkAction<void, State, void, Action>;


export const updateSearchParams: ActionCreator<Action> = (values) => ({type: 'updateSearchParams', payload: values});
export const resetSearchParams: ActionCreator<Action> = () => ({type: 'resetSearchParams'});
export const archiveEvent: ActionCreator<GenericThunkAction> = (eventId: number) => {
  return (dispatch) => {
    dispatch({type: 'archiveEventStart', payload: {eventId}});
    fetchJSON(`/api/event/${eventId}/archive/`, {method: 'POST'})
      .then(() => {
        dispatch({type: 'archiveEvent', payload: {eventId}});
      });
  };
};
export const updateMetadata: ActionCreator<GenericThunkAction> = () => {
  return (dispatch: Dispatch) => {
    return Promise.all([fetchJSON('/api/projects/'), fetchJSON('/api/event-types/')])
      .then(([projects, eventTypes]) => {
        dispatch({type: 'receiveMetadata', payload: {projects, eventTypes}});
      });
  };
};
