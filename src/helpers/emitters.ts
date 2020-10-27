import { Socket } from "socket.io";
import { IStateRecord } from "../types/types";
import { Trips } from "../components/trips";

// through all sockets obtained by callback
// emit trips bounded to client window and only for routes selected by client
export const emitReducedTrips = (
  getSockets: () => Socket[],
  trips: Trips,
  state: Record<string, IStateRecord>,
  isAdd: boolean = false
) => {
  const sockets = getSockets();
  sockets.forEach((socket) => {
    const oldIds = state[socket.id].ids || [];
    // filter bounded trips
    const boundedTrips = trips.getBounded(state[socket.id].bounds);
    // then filter selected
    let selectedTrips = trips.getSelected(
      boundedTrips,
      state[socket.id].selected
    );
    // save trip ids in the state
    const newIds = selectedTrips.map((trip) => trip.id);
    state[socket.id].ids = newIds;
    // find new ids
    // const addedIds = newIds.filter((id) => !oldIds.includes(id));
    // const updatedIds = newIds.filter((id) => oldIds.includes(id));
    // convert reduced trips into json and emit them depending on isAdd
    if (newIds.length > 0) {
      console.log(
        "updated IDS:",
        JSON.stringify(newIds)
        // JSON.stringify(newIds.map((id) => trips.getById(id).cur)) //TODO
      );
      const json = selectedTrips.map((trip) => trip.toJson()).join(",");
      socket.emit("update-trips", `[${json}]`);
    }
  });
};
