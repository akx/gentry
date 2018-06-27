import {Metadata} from '../types/state';
import {Reducer} from 'redux';

const initialMetadata: Metadata = {
  projects: [],
  eventTypes: [],
};

const metadataReducer: Reducer<Metadata> = (state = initialMetadata, action) => {
  if (!action) {
    return state;
  }
  switch (action.type) {
    case 'receiveMetadata': {
      const {projects, eventTypes} = action.payload;
      return {
        ...state,
        projects,
        eventTypes,
      };
    }
    default:
      return state;
  }
};

export default metadataReducer;
