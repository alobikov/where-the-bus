"use strict";
import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
import io from "socket.io-client";
import "./styles/index.css";
import RestApi from "./api/rest_api";
import { convertToInt, intPosToDeg } from "./math";
import { vilniusLngLat, socketUri, mapZoom } from "./config";
import * as render from "./render";
import { setStock, selected } from "./stock";
import {
  addNewTrips,
  makeStep,
  onMapBoundsChange,
  updateTrips,
} from "./helpers";
import store from "./redux/store";
import { removeTrip } from "./redux/actions";

const rest = new RestApi(__BASE_URL__);
const socket = io(socketUri);

function emitSelected(selected) {
  socket.emit("my-selected", selected);
}

rest.fetchRoutes().then((data) => {
  // console.log("fetchRoutes data:", data);
  setStock(data);
  render.currierList("bus", emitSelected);
});

rest.fetchToken().then(({ token }) => {
  mapboxgl.accessToken = token;
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11", // stylesheet location
    center: vilniusLngLat, // starting position [lng, lat]
    zoom: mapZoom, // starting zoom
  });
  initMapEvents(map);
  const socket = initSocketIo(map);
});

function animateMarkers(timestamp) {
  store.getState().allIds.forEach((id) => {
    const newCur = makeStep(id);
    store.getState().markersById[id]?.setLngLat(intPosToDeg(newCur));
  });
  requestAnimationFrame(animateMarkers);
}

function initMapEvents(map) {
  map.on("load", () => {
    document.querySelector(".controls-overlay").style.display = "block";
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
      emitSelected(selected);
    });
    // handle: slider open
    const sliderShowContainer = document.querySelector(
      ".slider-show-container"
    );
    const sliderBtn = document.getElementById("slider-show-btn");
    const filtersSlider = document.getElementById("filters-slider");
    sliderBtn.addEventListener("click", () => {
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
    // handle map zoom
    const zoomControl = document.querySelector(".zoom-control");
    zoomControl.addEventListener("click", (event) => {
      console.log(event.target.dataset.action);
      if (event.target.dataset.action === "in") map.zoomIn();
      else if (event.target.dataset.action === "out") map.zoomOut();
    });

    sliderBtn.dispatchEvent(new Event("click"));
  });
}

function initSocketIo(map) {
  // functions for injection
  function addMarker(busElm, lngLat) {
    return new mapboxgl.Marker(busElm)
      .setLngLat(intPosToDeg(lngLat))
      .addTo(map);
  }
  function updateMarkerPosition(id, cur) {
    store.getState().markersById[id].setLngLat(intPosToDeg(cur));
  }

  onMapBoundsChange({ emit: "my-bounds", socket, map, addMarker });
  socket.on("connect", () => {
    // console.log("connected");
    socket.emit("my-bounds", convertToInt(map.getBounds()));
    socket.emit("my-selected", selected);
  });
  // TODO bounds-request becomes obsolete
  socket.on("bounds-requested", () => {
    // console.log("bounds-requested");
    socket.emit("my-bounds", convertToInt(map.getBounds()));
  });
  socket.on("message", (payload) => console.log(payload));

  socket.on("update-trips", (payload) => {
    const data = JSON.parse(payload);
    const newIds = data.map((chunk) => chunk.id);
    const allIds = store.getState().allIds;
    // remove outdated trips
    const outdatedIds = allIds.filter((id) => !newIds.includes(id));
    // console.log("ids to remove", outdatedIds);
    outdatedIds.forEach((id) => store.dispatch(removeTrip(id)));
    // update existing trips
    const updatableIds = allIds.filter((id) => newIds.includes(id));
    const uTrips = data.filter((chunk) => updatableIds.includes(chunk.id));
    updateTrips(uTrips, updateMarkerPosition);
    // console.log("updated Ids:", updatableIds);
    // add new trips
    const additionalIds = newIds.filter((id) => !updatableIds.includes(id));
    if (additionalIds.length > 0) {
      // console.log("added Ids:", additionalIds);
      const aTrips = data.filter((chunk) => additionalIds.includes(chunk.id));
      addNewTrips(aTrips, addMarker);
    }
  });
  return socket;
}
