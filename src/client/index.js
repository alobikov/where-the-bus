"use strict";
import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
import RestApi from "./api/rest_api";
import io from "socket.io-client";

import "./styles/index.css";
import { park } from "./park";
import { vilniusLngLat, mapboxToken } from "./config";
import * as render from "./render";
import { setStock, allTypeRoutes, selected } from "./stock";
import {
  addNewTrips,
  makeStep,
  onMapBoundsChange,
  updateTrips,
} from "./helpers";
import store, { getPosition, removePosition } from "./redux/store";
import { keepIds } from "./redux/actions";

const rest = new RestApi();
const socket = io("http://localhost:9001");

function emitSelected(selected) {
  socket.emit("my-selected", selected);
}
socket.on("connect", () => {
  console.log("connected");
  socket.emit("my-bounds", map.getBounds());
  socket.emit("my-selected", selected);
});
// TODO bounds-request becomes obsolete
socket.on("bounds-requested", () => {
  console.log("bounds-requested");
  socket.emit("my-bounds", map.getBounds());
});
socket.on("message", (data) => console.log(data));
socket.on("update-trips", (data) => {
  const newData = JSON.parse(data);
  const newIds = newData.map((chunk) => chunk.id);
  const outdatedIds = store
    .getState()
    .allIds.filter((n) => !newIds.includes(n));
  console.log("ids to remove", outdatedIds);
  outdatedIds.forEach((id) => {
    store.getState().markersById[id].remove();
    store.dispatch({ type: "REMOVE_TRIP", id });
    removePosition(id);
  });

  console.log("update-trips Ids:", newIds);
  updateTrips(newData, updateMarkerPosition);
  // store.dispatch(keepIds(newIds));
  // park.cleanUp(newData); // remove irrelevant ids
  // park.setData(newData, addMarker);
  console.log("update-trips", newData);
  console.log("==============");
});
socket.on("add-trips", (data) => {
  const newData = JSON.parse(data);
  console.log("add-trips", data);
  if (data.length > 0) addNewTrips(newData, addMarker);
  // park.addData(newData, addMarker);
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
  store.getState().allIds.forEach((id) => {
    const newCur = makeStep(id);
    store.getState().markersById[id]?.setLngLat(newCur);
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
  });
  // handle: slider open
  const sliderShowContainer = document.querySelector(".slider-show-container");
  const sliderBtn = document.getElementById("slider-show-btn");
  const filtersSlider = document.getElementById("filters-slider");
  sliderBtn.addEventListener("click", () => {
    console.log("open");
    sliderBtn.classList.add("animate__animated", "animate__fadeOut");
    filtersSlider.style.display = "block";
    filtersSlider.classList.add("animate__animated", "animate__slideInDown");
    setTimeout(() => {
      sliderBtn.classList.remove("animate__animated", "animate__fadeOut");
      filtersSlider.classList.remove("animate__slideInDown");
      sliderShowContainer.style.display = "none";
    }, 700);
  });
  // handle: slider close
  const sliderClose = document.getElementById("slider-close");
  sliderClose.addEventListener("click", () => {
    filtersSlider.classList.add("animate__slideOutUp");
    setTimeout(() => {
      sliderShowContainer.style.display = "block";
      filtersSlider.style.display = "none";
      filtersSlider.classList.remove("animate__slideOutUp");
      sliderBtn.classList.add("animate__animated", "animate__fadeIn");
    }, 700);
  });
});

function updateMarkerPosition(id, cur) {
  store.getState().markersById[id].setLngLat(cur);
}

function removeMarkersFromMap(newIds) {
  let cnt = 0;
  store.getState().allIds.forEach((id) => {
    if (!newIds.includes(id)) {
      cnt++;
      store.getState().markersById[id].remove();
    }
  });
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
