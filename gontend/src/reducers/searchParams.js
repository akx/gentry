import update from 'immutability-helper';

const initialSearchParams = {
  project: null,
  search: '',
  type: null,
  limit: 5,
  offset: 0,
};

export default function searchParams(state = initialSearchParams, action = null) {
  switch (action.type) {
    case 'updateSearchParams': {
      const updateSpec = Object.keys(action.payload).reduce(
        (spec, key) => {
          spec[key] = {$set: action.payload[key]}; // eslint-disable-line no-param-reassign
          return spec;
        }, {},
      );
      return update(state, updateSpec);
    }
    default:
      return state;
  }
};