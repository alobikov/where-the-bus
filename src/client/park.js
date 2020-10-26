import * as math from "./math";
import { vilniusLngLat, STEPS } from "./config";

export const park = {
  ids: [],
  busElmsById: {}, // { uuid: { title: "4G", polyElm: {}, busElm: {}, type: "bus" | "tbus" } };
  markersById: {},
  pathById: {}, //{ uuid: { prev: [x,y], cur: [x,y], stepSize[x,y] } }
  setData(data, addMarkerToMap) {
    data.forEach((chunk) => {
      // chunk { id: '14019492402', type: 'bus', title: '76', cur: [ '25.292268', '54.720230' ],prev?: [number,number] }
      if (this.ids.includes(chunk.id)) updatePark(this, chunk);
      else {
        addToPark(this, chunk);
        addElmToPark(
          this,
          chunk,
          ...createBusElm(chunk.title, chunk.type === "bus" ? "blue" : "red"),
          addMarkerToMap
        );
      }
    });
  },
  addData(data, addMarkerToMap) {
    data.forEach((chunk) => {
      addToPark(this, chunk);
      addElmToPark(
        this,
        chunk,
        ...createBusElm(chunk.title, chunk.type === "bus" ? "blue" : "red"),
        addMarkerToMap
      );
    });
  },
  removeId(id) {
    _removeId(this, id);
  },
  cleanUp(data) {
    _cleanUp(this, data);
  },
  setStepSize(id, steps) {
    _setStepSize(this, id, steps);
  },
  makeStep(id) {
    return _makeStep(this, id);
  },
  getBusElm(id) {
    return this.busElmsById[id].busElm;
  },
  getLngLat(id) {
    return this.pathById[id].cur;
  },
  pathByIdToStr() {
    return JSON.stringify(this.pathById, null, 2);
  },
  busElmsByIdToStr() {
    return JSON.stringify(this.busElmsById, null, 2);
  },
};

function _removeId($, id) {
  console.log("removing id:", id);
  delete $.pathById[id];
  delete $.busElmsById[id];
  $.markersById[id].remove();
  delete $.markersById[id];
  $.ids = $.ids.filter((i) => i !== id);
}

function updatePark($, chunk) {
  console.log("update park");
  const { id } = chunk;
  const path = $.pathById[id];
  if (!chunk.cur) return; // 'marker Freezed' strategy #6

  path.prev = path.cur; // 'marker New Pos' strategy #1
  path.cur = chunk.cur;
  _setStepSize($, id, STEPS);
  //rotate markers in  moving direction
  _setCourse($, id, math.calcCourse(path.prev, chunk.cur));
}

function addToPark($, chunk) {
  const { id, cur, type, title } = chunk;
  $.ids.push(id);
  $.busElmsById[id] = { title, type };
  $.pathById[id] = { cur };
  if (!chunk.prev) {
    // 'marker addAllNew' strategy #3
  } else {
    // 'marker addNew' strategy #4
    $.pathById[id] = { ...$.pathById[id], prev: chunk.prev };
  }
  $.pathById[id].stepSize = [0, 0];
}

export function createBusElm(title, color) {
  const template = document.querySelector("#bus");
  const busElm = template.content.firstElementChild.cloneNode(true);
  const polyElm = busElm.querySelector("polygon");
  const circleElm = busElm.querySelector("circle");
  const textElm = busElm.querySelector("text");
  textElm.textContent = title;
  polyElm.setAttribute("fill", color);
  circleElm.setAttribute("fill", color);
  return [busElm, polyElm];
}

function addElmToPark($, chunk, busElm, polyElm, addMarkerToMap) {
  // console.log("addToPark", busElm);
  const { id, cur, course } = chunk;
  $.busElmsById[id] = {
    ...$.busElmsById[id],
    busElm: busElm,
    polyElm: polyElm,
  };
  // const old = prev || cur;
  _setCourse($, id, course);
  // _setCourse($, id, math.calcCourse(old, cur));
  $.markersById[id] = addMarkerToMap(busElm, cur);
  // console.log($.busElmsById);
  return id;
}

// function updateBusPos(id, newLngLat) {
//   const oldLngLat = pathById[id].prev;
//   if (!newLngLat) {
//     const newPos = incLngLat(oldLngLat, [-0.01, 0]);

//     pathById[id].cur = newPos;
//     console.log("newPos", newPos);
//     _setCourse(id, calcCourse(oldLngLat, newPos));
//     return id;
//   }
//   _setCourse(id, math.calcCourse(oldLngLat, newLngLat));
//   return id;
// }

function _setStepSize($, id, steps) {
  const prev = $.pathById[id].prev;
  const cur = $.pathById[id].cur;
  // console.log($);
  const vector = math.makeVector(prev, cur);
  $.pathById[id].stepSize = math.calcStepSize(vector, steps);
  return id;
}

// take marker by id and increase its cur by one step
function _makeStep($, id) {
  const prev = $.pathById[id].prev;
  const cur = $.pathById[id].cur;
  const stepSize = $.pathById[id].stepSize;
  if (math.isCoordinatesEqual(prev, cur, stepSize)) {
    return cur;
  }
  const newCoordinates = math.incLngLat(prev, stepSize);
  $.pathById[id].prev = newCoordinates;
  //   console.log(`${id.slice(0, 2)}`, newCoordinates);
  return newCoordinates;
}

// set course angle to the DOM element of corresponding marker id
// *** makes sideEffect ***
function _setCourse($, id, angle) {
  if (!$.busElmsById[id])
    throw new Error("Marker ID not found in Db while setting course angle");
  const { polyElm } = $.busElmsById[id];
  polyElm.setAttribute("transform", `rotate(${angle},11,11)`);
  //   console.log(polyElm);
}

// park.setData([{ id: "1234", title: "4G", type: "bus", cur: vilniusLngLat }]);
// console.log(park.pathByIdToStr());
// park.setData([
//   { id: "1234", cur: math.incLngLat(vilniusLngLat, [-0.05, 0.05]) },
// ]);
// console.log(park.pathByIdToStr());
// console.log(park.busElmsById);

function _cleanUp($, data) {
  const newIds = data.map((chunk) => chunk.id);
  console.log("cleanUp called with newIds", newIds);
  $.ids.forEach((id) => {
    if (newIds.includes(id)) return;
    _removeId($, id);
  });
}
