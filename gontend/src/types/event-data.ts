import {GenericMap} from './api';

export interface EventData {
  time_spent: null;
  project: string;
  exception: Exception;
  modules: GenericMap;
  extra: GenericMap;
  repos: GenericMap;
  message: string;
  platform: string;
  event_id: string;
  breadcrumbs: Breadcrumbs;
  tags: GenericMap;
  sdk: SDK;
  server_name: string;
  timestamp: string;
  level: number | string;
  culprit?: string;
  request?: Request;
  stacktrace?: Stacktrace;
}

export interface Breadcrumbs {
  values: Crumb[];
}

export interface Crumb {
  data: ValueData | null;
  message: null | string;
  timestamp: number;
  level: null | string;
  type: string;
  category: string;
}

export interface ValueData {
  method?: string;
  url?: string;
  status_code?: null;
  reason?: null;
  extra?: GenericMap;
}

export interface Exception {
  values: ExceptionValue[];
}

export interface ExceptionValue {
  module: string;
  stacktrace: Stacktrace;
  type: string;
  value: string;
}

export interface Stacktrace {
  frames: Frame[];
}

export interface Frame {
  module: null | string;
  function: string;
  abs_path: string;
  context_line?: string;
  post_context?: string[];
  lineno: number;
  pre_context?: string[];
  filename: string;
  vars: GenericMap;
  in_app?: boolean;
}

export interface Request {
  url: string;
  env: GenericMap<string>;
  cookies: GenericMap<string>;
  method: string;
  headers: GenericMap<string>;
  data: GenericMap<string>;
  query_string: string;
}

export interface SDK {
  name: string;
  version: string;
}
