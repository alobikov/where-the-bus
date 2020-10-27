// inject variable by help of webpack.DefinePlugin
let port = __SOCKET_PORT__;
let socketUri = "";
if (port !== 0) {
  socketUri = "http://localhost:" + port;
}

export { socketUri };
export const vilniusLngLat = [25.2832, 54.675528];
export const STEPS = 500;
export const mapboxToken =
  "pk.eyJ1IjoiYWxvYmlrb3YiLCJhIjoiY2tnMmR4cDFhMGdxcDJ4cGFoYTN6OGZ5NiJ9.RPGbumq9AG8XO4yWV4U9Dw";
