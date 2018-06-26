import {EventData} from './event-data';

type ISO8601 = string;

export interface GenericMap<T= any> {
  [key: string]: T;
}

export interface ListResponse {
  total: number;
  offset: number;
  limit: number;
}

export interface EventsResponse extends ListResponse {
  events: Event[];
}

export interface GroupsResponse extends ListResponse {
  groups: Group[];
}

export interface Event {
  archived: boolean;
  culprit: string;
  group?: Group;
  id: number;
  level: string;
  message: string;
  project_id: number;
  timestamp: ISO8601;
  type: string;
}

export interface GroupBase {
  archived: boolean;
  first_event_time: ISO8601;
  group_hash: string;
  id: number;
  last_event_time: ISO8601;
  n_events: number;
}

export interface Group extends GroupBase {
  first_event: Event;
}

export interface GroupDetail extends GroupBase {
  events: Event[];
}

export interface Project {
  name: string;
  slug: string;
  id: number;
}

export interface EventDetail extends Event {
  data: EventData;
  project: Project;
}
