import { SearchParams } from '../types/state';
import { Reducer } from 'redux';

const initialSearchParams: SearchParams = {
  project: null,
  search: '',
  type: null,
  limit: 30,
  offset: 0,
  archived: '',
  order: 'latest',
};

const searchParamsReducer: Reducer<SearchParams> = (state = initialSearchParams, action) => {
  switch (action.type) {
    case 'updateSearchParams': {
      return { ...state, ...action.payload };
    }
    case 'resetSearchParams':
      return { ...initialSearchParams };
    default:
      return state;
  }
};

export default searchParamsReducer;
