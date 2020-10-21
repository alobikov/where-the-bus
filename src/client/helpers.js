export function onMapBoundsChange({ emit, socket, map, addMarker }) {
  var timeout;
  var bounds = map.getBounds();
  map.on("resize", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => socket.emit(emit, map.getBounds()), 1000);
  });
  map.on("dragend", () => socket.emit(emit, map.getBounds()));
  map.on("zoomend", () => {
    socket.emit(emit, map.getBounds());
    // addMarker(null, map.getBounds()._ne);
  });
}
