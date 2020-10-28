import http from "http";
import { promises as fs } from "fs";
import path from "path";
import socketIO from "socket.io";

import busRoutes from "./components/bus_routes";
import trips from "./components/trips";
import apiStops from "./services/stops_lt";
import PollService from "./services/poll_service";
import { emitReducedTrips } from "./components/emitter";
import * as config from "./config";
import { state } from "./components/state";
import { stats } from "./components/stats";
import { convertToUptime } from "./utils/math";
import { IBusRoutes } from "./types/types";
import { apiToken } from "./apiToken";

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
  apiStops.fetchAll().then((data) => {
    const [oldIds, newIds] = trips.set(data);
  });
};

// update and report statistics regularly
setInterval(() => {
  stats.tripsAmount = trips.length;
  stats.clientsAmount = Object.keys(state).length;
  stats.uptime = convertToUptime(process.uptime());
  // console.log(`trips: ${stats.tripsAmount}; clients: ${stats.clientsAmount}`);
}, 10000);

const server: http.Server = http.createServer((req, res) => {
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
    case /\/token/.test(req.url): {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify({ token: apiToken }));
      res.end();
      break;
    }
    case /\/assets\/.+(xml|svg)/.test(req.url): {
      fs.readFile(path.resolve("public", req.url.slice(1))).then((contents) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "image/svg+xml;charset=utf-8");
        res.writeHead(200);
        res.end(contents);
      });
      break;
    }
    case /\/assets\/.+(ico|png)$/.test(req.url): {
      fs.readFile(path.resolve("public", req.url.slice(1))).then((contents) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "image/png");
        res.writeHead(200);
        res.end(contents);
      });
      break;
    }
    case /.js$/.test(req.url): {
      fs.readFile(path.resolve("public", req.url.slice(1))).then((contents) => {
        res.setHeader("Content-Type", "application/script");
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
  state[socket.id] = {}; // create empty record for user in state
  socket.emit("bounds-requested");

  //! ******************** POLLING ***********************
  const pollService = PollService.instance(() => {
    apiStops.fetchAll().then((data) => {
      const [oldIds, newIds] = trips.set(data);
      emitReducedTrips(pollService.getSubscribers, trips, state);
      // console.log("old trips", oldIds);
      // console.log("new trips", newIds);
    });
  });
  pollService.subscribe(socket);
  //!=====================================================

  socket.on("my-bounds", (bounds) => {
    state[socket.id] = {
      ...state[socket.id],
      bounds,
    };
    emitReducedTrips(() => [socket], trips, state);
    // console.log(`${socket.id} my-bounds`, state);
  });

  socket.on("my-selected", (selected) => {
    // handle 'all' token in received selected
    let selectedResult: IBusRoutes = { ...selected };
    if (!selected || selected.bus.includes("all")) {
      selectedResult = { ...selectedResult, bus: busRoutes.allBus };
    }
    if (!selected || selected.tbus.includes("all")) {
      selectedResult = { ...selectedResult, tbus: busRoutes.allTbus };
    }
    state[socket.id] = { ...state[socket.id], selected: selectedResult };
    emitReducedTrips(() => [socket], trips, state);
    // console.log(`${socket.id} my-selected`, state);
  });

  socket.on("disconnect", () => {
    pollService.unsubscribe(socket);
    const id = socket.id;
    delete state[id];
    console.log("disconnected and state cleaned", id);
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
