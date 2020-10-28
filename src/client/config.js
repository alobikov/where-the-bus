// inject variable by help of webpack.DefinePlugin
let port = __SOCKET_PORT__;
let socketUri = "";
if (port !== 0) {
  socketUri = "http://localhost:" + port;
}

export { socketUri };
export const vilniusLngLat = [25.291478, 54.686363];
export const mapZoom = 15;
export const STEPS = 500;
