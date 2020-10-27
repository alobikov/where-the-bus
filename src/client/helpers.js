import store, {
  setPosition,
  getPosition,
  setPositionPrev,
  setPositionStepSize,
} from "./redux/store";
import { addTrip, addMarker, setCourse, removeTrip } from "./redux/actions";
import { createBusElm } from "./park";
import { vilniusLngLat, STEPS } from "./config";
import * as math from "./math";

export function onMapBoundsChange({ emit, socket, map, addMarker }) {
  var timeout; // debounce user action for zoom or pane
  map.on("resize", () => {
    clearTimeout(timeout);
    timeout = setTimeout(
      () => socket.emit(emit, math.convertToInt(map.getBounds())),
      1000
    );
  });
  map.on("dragend", () =>
    socket.emit(emit, math.convertToInt(map.getBounds()))
  );
  map.on("zoomend", () => {
    socket.emit(emit, math.convertToInt(map.getBounds()));
  });
}

const stepSize = (x, y) => [x, y];

export function addNewTrips(data, addMarkerToMap) {
  data.forEach((chunk) => {
    const { id, cur, course, title, type } = chunk;
    const color = type === "bus" ? "blue" : "red";
    let [busElm, polyElm] = createBusElm(title, color);
    store.dispatch(addTrip(id, title, type, polyElm));
    store.dispatch(setCourse(id, course, "add_new"));
    // now add path
    setPosition(id, cur, cur, stepSize(0, 0));
    // now we can add marker
    const marker = addMarkerToMap(busElm, cur);
    // store marker in state
    if (!marker) throw new Error("failed to create marker in addNewTrips", id);
    store.dispatch(addMarker(id, marker));
  });
}
export function updateTrips(data, updateMarkerPos) {
  data.forEach((chunk) => {
    const { id, cur, course } = chunk;
    const [prevStored, curStored, stepStored] = getPosition(id);
    if (!math.isCoordinatesEqual(curStored, cur, [0.00001, 0.00001])) {
      setPosition(id, curStored, cur, stepSize);
      const stepSize = calcStepSize(id, STEPS);
      console.log("step size", stepSize);
      setPositionStepSize(id, stepSize);
      updateMarkerPos(id, cur);
      store.dispatch(setCourse(id, course, "update"));
    }
  });
}

// take marker by id and increase its cur by one step
export function makeStep(id) {
  const [prev, cur, stepSize] = getPosition(id);
  if (math.isCoordinatesEqual(prev, cur, stepSize)) {
    return cur;
  }
  const newCoordinates = math.incLngLat(prev, stepSize);
  setPositionPrev(id, newCoordinates);
  //   console.log(`${id.slice(0, 2)}`, newCoordinates);
  return newCoordinates;
}

function calcStepSize(id, steps) {
  const [prev, cur, stepSize] = getPosition(id);
  const vector = math.makeVector(prev, cur);
  return math.calcStepSize(vector, steps);
}
