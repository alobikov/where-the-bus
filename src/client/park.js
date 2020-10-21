import * as math from "./math";
import { vilniusLngLat, STEPS } from "./config";

export const park = {
  ids: [],
  busElmsById: {}, // { uuid: { title: "4G", polyElm: {}, busElm: {}, type: "bus" | "tbus" } };
  markersById: {},
  pathById: {}, //{ uuid: { prevLngLat: [x,y], curLngLat: [x,y], stepSize[x,y] } }
  setData(data, addMarkerToMap) {
    data.forEach((chunk) => {
      // chunk { id: '14019492402', type: 'bus', title: '76', lngLat: [ '25.292268', '54.720230' ] }
      if (this.ids.includes(chunk.id)) updatePark(this, chunk);
      else {
        addToPark(this, chunk);
        addElmToPark(
          this,
          chunk.id,
          ...createBusElm(chunk.title, chunk.type === "bus" ? "blue" : "red"),
          addMarkerToMap,
          chunk.lngLat,
          chunk.course
        );
      }
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
    return this.pathById[id].curLngLat;
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

function updatePark($, { id, lngLat }) {
  console.log("update park");
  const path = $.pathById[id];
  if (path.curLngLat[0] === lngLat[0] && path.curLngLat[1] === lngLat[1]) {
    return;
  }
  path.prevLngLat = path.curLngLat;
  path.curLngLat = lngLat;
  _setStepSize($, id, STEPS);
  //rotate markers in  moving direction
  _setCourse($, id, math.calcCourse($.pathById[id].prevLngLat, lngLat));
}

function addToPark($, chunk) {
  const { id } = chunk;
  $.ids.push(id);
  $.pathById[id] = { prevLngLat: chunk.lngLat, curLngLat: chunk.lngLat };
  $.busElmsById[id] = { title: chunk.title, type: chunk.type };
  $.pathById[id].stepSize = [0, 0];
}

function createBusElm(title, color) {
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

function addElmToPark($, id, busElm, polyElm, addMarkerToMap, lngLat, course) {
  // console.log("addToPark", busElm);
  $.busElmsById[id] = {
    ...$.busElmsById[id],
    busElm: busElm,
    polyElm: polyElm,
  };
  _setCourse($, id, course);
  $.markersById[id] = addMarkerToMap(busElm, lngLat);
  // console.log($.busElmsById);
  return id;
}

// function updateBusPos(id, newLngLat) {
//   const oldLngLat = pathById[id].prevLngLat;
//   if (!newLngLat) {
//     const newPos = incLngLat(oldLngLat, [-0.01, 0]);

//     pathById[id].curLngLat = newPos;
//     console.log("newPos", newPos);
//     _setCourse(id, calcCourse(oldLngLat, newPos));
//     return id;
//   }
//   _setCourse(id, math.calcCourse(oldLngLat, newLngLat));
//   return id;
// }

function _setStepSize($, id, steps) {
  const prev = $.pathById[id].prevLngLat;
  const cur = $.pathById[id].curLngLat;
  // console.log($);
  const vector = math.makeVector(prev, cur);
  $.pathById[id].stepSize = math.calcStepSize(vector, steps);
  return id;
}

// take marker by id and increase its curLngLat by one step
function _makeStep($, id) {
  const prev = $.pathById[id].prevLngLat;
  const cur = $.pathById[id].curLngLat;
  const stepSize = $.pathById[id].stepSize;
  if (math.isCoordinatesEqual(prev, cur, stepSize)) {
    return cur;
  }
  const newCoordinates = math.incLngLat(prev, stepSize);
  $.pathById[id].prevLngLat = newCoordinates;
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

// park.setData([{ id: "1234", title: "4G", type: "bus", lngLat: vilniusLngLat }]);
// console.log(park.pathByIdToStr());
// park.setData([
//   { id: "1234", lngLat: math.incLngLat(vilniusLngLat, [-0.05, 0.05]) },
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
