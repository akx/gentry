import { combineReducers } from 'redux';
import searchParamsReducer from './searchParams';
import metadataReducer from './metadata';

const rootReducer = combineReducers({
  searchParams: searchParamsReducer,
  metadata: metadataReducer,
});
export default rootReducer;
