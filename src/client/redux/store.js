import { createStore, combineReducers } from "redux";
import { allIds, busElmsById, markersById } from "./reducers/all_reducers";

export const position = {};
export const setPosition = (id, prev, cur, stepSize) => {
  position[id] = { prev, cur, stepSize };
};
export const setPositionPrev = (id, prev) => {
  position[id].prev = prev;
};
export const setPositionStepSize = (id, stepSize) => {
  position[id].stepSize = stepSize;
};
export const getPosition = (id) => {
  try {
    return [position[id].prev, position[id].cur, position[id].stepSize];
  } catch (e) {
    console.log("getPosition not found id", id);
  }
};
export const removePosition = (id) => {
  delete position[id];
};

const parkReducer = combineReducers({
  allIds,
  busElmsById,
  markersById,
});

const store = createStore(
  parkReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__({
      actionSanitizer,
      stateSanitizer,
    })
);
export default store;

function stateSanitizer(state) {
  let newState = state;
  if (state.markersById)
    newState = {
      ...state,
      markersById: Object.fromEntries(
        Object.keys(state.markersById).map((key) => [key, "m obj"])
      ),
    };

  if (state.busElmsById)
    newState = {
      ...newState,
      busElmsById: Object.fromEntries(
        Object.keys(newState.busElmsById).map((key) => [
          key,
          { ...newState.busElmsById[key], polyElm: "pElm obj" },
        ])
      ),
    };
  return newState;
}

function actionSanitizer(action) {
  if (action.type === "ADD_TRIP" && action.polyElm)
    return { ...action, polyElm: "pElm obj" };
  if (action.type === "ADD_MARKER" && action.marker)
    return { ...action, marker: "m obj" };
  return action;
}
