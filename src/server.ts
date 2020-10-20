import { IBusRoutes } from "./types/types";
import http from "http";
import socketIO from "socket.io";
import BusRoutes from "./bus_routes";
import Trips from "./trips";
import apiStops from "./services/stops_lt";
import Interval from "./interval";
import { Socket } from "dgram";

const port: number = 9001;
var selectedId;
const busRoutes = new BusRoutes();
const trips = new Trips();

interface IStateRecord {
  bounds?: [[number, number], [number, number]];
  selected?: { tbus: string[]; bus: string[] };
}
const state: Record<string, IStateRecord> = {};

// init Routes and Trips collections; called once
apiStops.fetchAll().then((data) => {
  busRoutes.set(data);
  trips.set(data);
  // state.selected = busRoutes.allTypes as any;
});
// fetch from stops.lt and parse data to internal collection; called on interval
const fetchAndUpdateTrips = () => {
  apiStops.fetchAll().then((data) => trips.set(data));
};
// emit trips bounded to client window and only for routes selected by client
const emitReducedTrips = (socket) => {
  // console.log("in emitReduced", state[socket.id]?.bounds);
  const boundedTrips = trips.getBounded(state[socket.id].bounds);
  const selectedTrips = trips.getSelected(
    boundedTrips,
    state[socket.id].selected
  );
  socket.emit(
    "new-trips",
    `[${selectedTrips.map((trip) => trip.toJson()).join(",")}]`
  );
};
// report each minute
setInterval(() => {
  console.log("Records in trips:", trips.length, trips.getDead().length);
  const deadList = trips.removeOutdated();
  console.log(deadList);
}, 60000);
6;
const server = http.createServer((req, res) => {
  switch (req.url) {
    case "/": {
      res.statusCode = 200; // default value
      res.end("Welcome to WhereMyBus API");
      return;
    }
    case "/routes": {
      console.log("GET '/rotes' request");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.write(busRoutes.toJson());
      res.end();
      return;
    }
    case "/trips": {
      console.log("GET '/trips' request");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.write(trips.toJson());
      res.end();
      return;
    }
    default: {
      res.statusCode = 404;
      res.end("<h1>Resource not found!</h1>");
    }
  }
});

// const logger = new Logger();
// logger.on("message", (payload) => {
//   console.log(payload);
// });

// logger.log();

const io: socketIO.Server = socketIO(server);

io.on("connect", (socket) => {
  console.log("*** Socket.io user connected ***", socket.id);
  socket.emit("bounds-requested");

  //! ******************** POLLING ***********************
  const pollDataProvider = new Interval(() => {
    // set task(s) for the interval
    fetchAndUpdateTrips();
    emitReducedTrips(socket);
  }, 5000);
  pollDataProvider.start();

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
    emitReducedTrips(socket);
    socket.emit("message", socket.id);
  });

  socket.on("my-selected", (selected) => {
    // console.log(`${socket.id} my-selected`, selected);
    state[socket.id] = { ...state[socket.id], selected };
    emitReducedTrips(socket);
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
