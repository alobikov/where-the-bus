import http from "http";
const fs = require("fs").promises;
import path from "path";
import socketIO from "socket.io";

import busRoutes from "./components/bus_routes";
import trips from "./components/trips";
import apiStops from "./services/stops_lt";
import Interval from "./utils/interval";
import { emitReducedTrips } from "./helpers/emitters";
import * as config from "./config";
import { state } from "./components/state";
import { stats } from "./components/stats";
import { convertToUptime } from "./utils/math";
import { IBusRoutes } from "./types/types";

const runDuration = parseFloat(process.env.RUN_DURATION) || config.runDuration; //  default - forever
const port = parseInt(process.env.PORT) || config.port;

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

// update and report statistics regularly
setInterval(() => {
  stats.tripsAmount = trips.length;
  stats.clientsAmount = Object.keys(state).length;
  stats.uptime = convertToUptime(process.uptime());
  console.log(`trips: ${stats.tripsAmount}; clients: ${stats.clientsAmount}`);
}, 60000);

const server = http.createServer((req, res) => {
  switch (true) {
    case /\/routes/.test(req.url): {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.write(busRoutes.toJson());
      res.end();
      break;
    }
    case /\/trips/.test(req.url): {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.write(trips.toJson());
      res.end();
      break;
    }
    case /\/stats/.test(req.url): {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.write(stats.toHtml());
      res.end();
      break;
    }
    case /\/public\/.+(xml|svg)/.test(req.url): {
      fs.readFile(path.resolve(req.url.slice(1))).then((contents) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "image/svg+xml;charset=utf-8");
        res.writeHead(200);
        res.end(contents);
      });
      break;
    }
    case /\/public\/.*/.test(req.url): {
      fs.readFile(path.resolve(req.url.slice(1))).then((contents) => {
        res.setHeader("Content-Type", "text/css");
        res.writeHead(200);
        res.end(contents);
      });
      break;
    }
    case /\//.test(req.url): {
      fs.readFile(path.resolve("public/index.html")).then((contents) => {
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(contents);
      });
      break;
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
  if (runDuration !== 0) {
    setTimeout(() => {
      pollDataProvider.stop();
      console.log("Polling of Data Provider stopped!");
    }, 3600 * 1000 * runDuration); //hours
  }
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
    console.log(`${socket.id} my-selected`, selected);

    // handle 'all' token in received selected
    let selectedResult: IBusRoutes = { ...selected };
    if (!selected || selected.bus.includes("all")) {
      selectedResult = { ...selectedResult, bus: busRoutes.allBus };
    }
    if (!selected || selected.tbus.includes("all")) {
      selectedResult = { ...selectedResult, tbus: busRoutes.allTbus };
    }
    state[socket.id] = { ...state[socket.id], selected: selectedResult };
    emitReducedTrips(socket, trips, state);
  });

  socket.on("disconnect", () => {
    pollDataProvider.stop();
    const id = socket.id;
    delete state[id];
    console.log("disconnected", id);
  });
});

const until = !!runDuration
  ? new Date(Date.now() + 3600 * 1000 * runDuration).toLocaleString()
  : "forever";
stats.runningUntil = until;

server.listen(port, () => {
  console.log(
    `Server running on port ${(server.address() as any).port} until: ${until}`
  );
});
