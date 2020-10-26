//? busElmsById: { uuid: { title: "4G", polyElm: {}, busElm: {}, type: "bus" | "tbus" }, ... };

export const allIds = (state = [], action) => {
  switch (action.type) {
    case "ADD_TRIP": {
      return [...state, action.id];
    }
    case "REMOVE_TRIP": {
      return state.filter((id) => id !== action.id);
    }
    case "KEEP_IDS": {
      return action.ids;
    }
    default:
      return state;
  }
};

export const markersById = (state = {}, action) => {
  switch (action.type) {
    case "ADD_MARKER": {
      return { ...state, [action.id]: action.marker };
    }
    case "REMOVE_TRIP": {
      const { [action.id]: trash, ...newState } = state;
      return newState;
    }
    case "KEEP_IDS": {
      return Object.fromEntries(action.ids.map((id) => [id, state[id]]));
    }
    default:
      return state;
  }
};

export const busElmsById = (state = {}, action) => {
  switch (action.type) {
    case "ADD_TRIP": {
      return {
        ...state,
        [action.id]: {
          title: action.title,
          type: action.busType,
          polyElm: action.polyElm,
        },
      };
    }
    case "KEEP_IDS": {
      return Object.fromEntries(action.ids.map((id) => [id, state[id]]));
    }
    case "REMOVE_TRIP": {
      const { [action.id]: trash, ...newState } = state;
      return newState;
    }
    case "SET_COURSE": {
      const { polyElm } = state[action.id];
      polyElm.setAttribute("transform", `rotate(${action.angle},11,11)`);
      return state;
    }
    default:
      return state;
  }
};

// pathById: {}, //{ uuid: { prev: [x,y], cur: [x,y], stepSize[x,y] } }
