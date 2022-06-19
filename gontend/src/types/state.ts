import { Project } from './api';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

export interface SearchParams {
  project: null;
  search: string;
  type: null;
  limit: number;
  offset: number;
  archived: '' | 'true' | 'false';
  order: 'latest' | 'earliest' | 'most_common';
}

export interface Metadata {
  projects: Project[];
  eventTypes: string[];
}

export interface State {
  searchParams: SearchParams;
  metadata: Metadata;
}

export type AppThunkDispatch = ThunkDispatch<State, void, AnyAction>;
