import { combineReducers } from 'redux';
import searchParams from './searchParams';
import metadata from './metadata';

const rootReducer = combineReducers({
  searchParams,
  metadata,
});
export default rootReducer;
