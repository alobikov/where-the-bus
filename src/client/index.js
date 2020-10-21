import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
import RestApi from "./api/rest_api";
import io from "socket.io-client";

import { park } from "./park";
import { vilniusLngLat, mapboxToken } from "./config";
import * as render from "./render";
import { setStock, allTypeRoutes, selected } from "./stock";
import { onMapBoundsChange } from "./helpers";

const rest = new RestApi();
const socket = io("ws://localhost:9001");
console.log(socket);

function emitSelected(selected) {
  socket.emit("my-selected", selected);
}

socket.on("bounds-requested", () => {
  console.log("bounds-requested");
  socket.emit("my-bounds", map.getBounds());
});
socket.on("message", (data) => console.log(data));
socket.on("new-trips", (data) => {
  const newData = JSON.parse(data);
  console.log(newData);
  park.cleanUp(newData); // remove irrelevant ids
  park.setData(newData, addMarker);
});

rest.fetchRoutes().then((data) => {
  // console.log("fetchRoutes data:", data);
  setStock(data);
  render.currierList("bus", emitSelected);
});

// rest.fetchTrips().then((data) => {
//   console.log("trips", data);
//   park.setData(data);
// });

mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11", // stylesheet location
  center: vilniusLngLat, // starting position [lng, lat]
  zoom: 17, // starting zoom
});
// function for injection
function addMarker(busElm, lngLat) {
  return new mapboxgl.Marker(busElm).setLngLat(lngLat).addTo(map);
}

function animateMarkers(timestamp) {
  park.ids.forEach((id) => {
    const lngLat = park.makeStep(id);

    park.markersById[id]?.setLngLat(park.makeStep(id));
    // debugger;
  });
  requestAnimationFrame(animateMarkers);
}

onMapBoundsChange({ emit: "my-bounds", socket, map, addMarker });

map.on("load", () => {
  requestAnimationFrame(animateMarkers);
  // on mapDidMount add list of bus (by default) route selection buttons to the screen
  // render.currierList();

  // handle drop down menu: switch the carrier type
  const carrier = document.getElementById("carrier");
  carrier.addEventListener("change", (e) => {
    render.currierList(e.target.value, emitSelected);
  });
  // handle: if route button pressed then redraw all buttons
  // with respect to carrier type
  const filters = document.getElementById("filters");
  filters.addEventListener("click", (e) => {
    render.filtered(e.target.name, carrier.value, emitSelected);
    console.log("selected bus", selected.bus);
    console.log("selected tbus", selected.tbus);
    emitSelected(selected);
    // initSelectedMarkers(selected);
    // initMarkers();
  });
});

function removeMarkers() {
  let cnt = 0;
  park.ids.forEach((id) => {
    if (park.markersById[id]) {
      cnt++;
      park.markersById[id].remove();
    }
  });
  park.markersById = {};
  // park.ids = [];
  // park.busElmsById = {};
  // park.pathById = {};
  console.log("Markers removed", cnt);
}
function initMarkers() {
  removeMarkers();

  let resultMarkers = {};
  park.ids.forEach((id) => {
    // console.log("initiating", id);
    const busElm = park.getBusElm(id);
    const lngLat = park.getLngLat(id);
    resultMarkers = { ...resultMarkers, [id]: addMarker(busElm, lngLat) };
  });
  return resultMarkers;
}
function initSelectedMarkers(selected) {
  removeMarkers();
  let resultMarkers = {};
  console.log("selected bus", selected.bus);
  console.log("selected tbus", selected.tbus);
  park.ids.forEach((id) => {
    const record = park.busElmsById[id];
    if (
      (selected.bus.includes(record.title) && record.type === "bus") ||
      (selected.tbus.includes(record.title) && record.type === "tbus")
    ) {
      const busElm = park.getBusElm(id);
      const lngLat = park.getLngLat(id);
      resultMarkers.id = addMarker(busElm, lngLat);
    }
  });
  console.log("initSelectedMarkers", resultMarkers);
  return resultMarkers;
}
