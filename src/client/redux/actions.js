export const addTrip = (id, title, busType, polyElm) => ({
  type: "ADD_TRIP",
  id,
  title,
  busType,
  polyElm,
});

export const keepIds = (ids) => ({
  type: "KEEP_IDS",
  ids,
});

export const setCourse = (id, angle, org) => ({
  type: "SET_COURSE",
  id,
  angle,
  org,
});

export const addMarker = (id, marker) => ({
  type: "ADD_MARKER",
  id,
  marker,
});

export const removeTrip = (id) => ({
  type: "REMOVE_TRIP",
  id,
});
