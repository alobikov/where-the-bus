import { IAllRoutes } from "./types/types";
import http from "http";
import socketIO from "socket.io";
import AllRoutes from "./all_routes";
import AllTrips from "./all_trips";
import apiStops from "./services/stops_lt";
import Interval from "./interval";

const port: number = 9001;
var selectedId;
const allRoutes = new AllRoutes();
const allTrips = new AllTrips();
const state = {
  bounds: [
    [0, 0],
    [0, 0],
  ],
  selected: { tbus: [], bus: [] },
};

// init Routes and Trips collections
apiStops.fetchAll().then((data) => {
  allRoutes.set(data);
  allTrips.set(data);
  console.log("selectedID", selectedId);
  console.log("Amount of active trips on 'stops.lt':", allTrips.length);
  state.selected = allRoutes.allTypes as any;
});

const updateTrips = () => {
  apiStops.fetchAll().then((data) => {
    allTrips.set(data);
    // console.log("Active trips:", allTrips.length);
  });
};

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
      res.write(allRoutes.toJson());
      res.end();
      return;
    }
    case "/trips": {
      console.log("GET '/trips' request");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.write(allTrips.toJson());
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

io.on("connection", (socket) => {
  console.log("*** Socket.io user connected ***");
  socket.emit("bounds-requested");

  //! ******************** POLLING ***********************
  const pollDataProvider = new Interval(() => {
    // set task(s) for the interval
    updateTrips();
    const boundedTrips = allTrips.getBounded(state.bounds);
    const trips = boundedTrips.filter(
      (trip) =>
        (state.selected.tbus.includes(trip.title) && trip.type === "tbus") ||
        (state.selected.bus.includes(trip.title) && trip.type === "bus")
    );
    // console.log(`${trips.length} boudned trips:`, trips);
    io.emit("new-trips", `[${trips.map((trip) => trip.toJson()).join(",")}]`);
  }, 5000);
  pollDataProvider.start();

  setTimeout(() => {
    pollDataProvider.stop();
    console.log("Polling of Data Provider stopped!");
  }, 3600 * 1000 * 1); //hours
  //!=====================================================

  socket.on("my-bounds", (bounds) => {
    console.log("my-bounds", bounds);
    state.bounds = [
      [bounds._sw.lng, bounds._sw.lat],
      [bounds._ne.lng, bounds._ne.lat],
    ];
  });

  socket.on("my-selected", (selected) => {
    console.log(selected);
    state.selected = selected;
  });
});

server.listen(port, () => {
  console.log("Server running on", (server.address() as any).port);
});
