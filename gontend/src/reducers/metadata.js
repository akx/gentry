const initialMetadata = {
  projects: [],
  eventTypes: [],
};

export default function metadata(state = initialMetadata, action = null) {
  switch (action.type) {
    case 'receiveMetadata': {
      const { projects, eventTypes } = action.payload;
      return {
        ...state,
        projects,
        eventTypes,
      };
    }
    default:
      return state;
  }
}
