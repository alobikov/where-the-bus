import { Socket } from "socket.io";
import { StateProps } from "./types/types";
import { Trips } from "./trips";

// emit trips bounded to client window and only for routes selected by client
export const emitReducedTrips = (
  socket: Socket,
  trips: Trips,
  state: StateProps
) => {
  // console.log("in emitReduced", state[socket.id]?.bounds);
  const boundedTrips = trips.getBounded(state[socket.id].bounds);
  const selectedTrips = trips.getSelected(
    boundedTrips,
    state[socket.id].selected
  );
  const json = selectedTrips.map((trip) => trip.toJson()).join(",");
  socket.emit("new-trips", `[${json}]`);
  return selectedTrips;
};
