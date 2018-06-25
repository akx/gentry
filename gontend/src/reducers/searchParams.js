const initialSearchParams = {
  project: null,
  search: '',
  type: null,
  limit: 30,
  offset: 0,
  archived: '',
};

export default function searchParams(state = initialSearchParams, action = null) {
  switch (action.type) {
    case 'updateSearchParams': {
      return { ...state, ...action.payload };
    }
    case 'resetSearchParams':
      return { ...initialSearchParams };
    default:
      return state;
  }
}
