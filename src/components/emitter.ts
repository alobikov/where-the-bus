import { Socket } from "socket.io";
import { IStateRecord } from "../types/types";
import { Trips } from "./trips";

// through all sockets obtained by callback
// emit trips bounded to client window and only for routes selected by client
export const emitReducedTrips = (
  getSockets: () => Socket[],
  trips: Trips,
  state: Record<string, IStateRecord>
) => {
  const sockets = getSockets();
  // console.log(state);
  sockets.forEach((socket) => {
    if (Object.keys(state[socket.id]).length === 0) return;
    const oldIds = state[socket.id].ids || [];
    // filter bounded trips
    const boundedTrips = trips.getBounded(state[socket.id].bounds);
    // then filter selected
    let selectedTrips = trips.getSelected(
      boundedTrips,
      state[socket.id].selected
    );
    // find ids of bounded and selected trips
    const newIds = selectedTrips.map((trip) => trip.id);
    // save ids in the client's state
    state[socket.id].ids = newIds;

    if (newIds.length > 0) {
      // convert reduced trips into json and emit them
      const json = selectedTrips.map((trip) => trip.toJson()).join(",");
      socket.emit("update-trips", `[${json}]`);
    }
  });
};
