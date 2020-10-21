import http from "http";
import socketIO from "socket.io";

import busRoutes from "./components/bus_routes";
import trips from "./components/trips";
import apiStops from "./services/stops_lt";
import Interval from "./utils/interval";
import { emitReducedTrips } from "./helpers/emitters";
import { port } from "./config";
import { state } from "./components/state";
import { stats } from "./components/stats";

// fetch from stops.lt
// init Routes and Trips collections
// called once only here
apiStops.fetchAll().then((data) => {
  busRoutes.set(data);
  trips.set(data);
});

// fetch from stops.lt
// and parse data to internal collection
// called on interval
const fetchAndUpdateTrips = () => {
  apiStops.fetchAll().then((data) => trips.set(data));
};

// report stats each minute
setInterval(() => {
  stats.tripsAmount = trips.length;
  stats.clientsAmount = Object.keys(state).length;
  console.log(`trips: ${stats.tripsAmount}; clients: ${stats.clientsAmount}`);
}, 60000);

const server = http.createServer((req, res) => {
  switch (req.url) {
    case "/": {
      res.statusCode = 200; // default value
      res.end("Welcome to WhereMyBus API");
      return;
    }
    case "/routes": {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.write(busRoutes.toJson());
      res.end();
      return;
    }
    case "/trips": {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.write(trips.toJson());
      res.end();
      return;
    }
    case "/stats": {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.write(stats.toHtml());
      res.end();
    }
    default: {
      res.statusCode = 404;
      res.end("<h1>Resource not found!</h1>");
    }
  }
});

const io: socketIO.Server = socketIO(server);

io.on("connect", (socket) => {
  console.log("*** Socket.io user connected ***", socket.id);
  socket.emit("bounds-requested");

  //! ******************** POLLING ***********************
  const pollDataProvider = new Interval(() => {
    // set task(s) for the interval
    fetchAndUpdateTrips();
    emitReducedTrips(socket, trips, state);
  }, 5000);
  pollDataProvider.start();
  //? Stop polling
  setTimeout(() => {
    pollDataProvider.stop();
    console.log("Polling of Data Provider stopped!");
  }, 3600 * 1000 * 1); //hours
  //!=====================================================

  socket.on("my-bounds", (bounds) => {
    // console.log(`${socket.id} my-bounds`, bounds);
    state[socket.id] = {
      ...state[socket.id],
      bounds: [
        [bounds._sw.lng, bounds._sw.lat],
        [bounds._ne.lng, bounds._ne.lat],
      ],
    };
    emitReducedTrips(socket, trips, state);
  });

  socket.on("my-selected", (selected) => {
    // console.log(`${socket.id} my-selected`, selected);
    state[socket.id] = { ...state[socket.id], selected };
    emitReducedTrips(socket, trips, state);
  });

  socket.on("disconnect", () => {
    pollDataProvider.stop();
    const id = socket.id;
    delete state[id];
    console.log("disconnected", state);
  });
});

server.listen(port, () => {
  console.log("Server running on", (server.address() as any).port);
});
