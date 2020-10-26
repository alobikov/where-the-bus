import { IBusRoutes, ITripCollection, IVec } from "./../types/types";
import Trip from "./trip";
import { calcCourse, isPntInBounds, isCoordinatesEqual } from "../utils/math";

export class Trips {
  private all: Record<string, Trip> = {}; // {'1234': Trip_instance,....}
  private allIds: string[] = [];

  set(data: ITripCollection[]): [string[], string[]] {
    const newAll: Record<string, Trip> = {};
    const newAllIds: string[] = [];
    let newTripIds: string[] = [];
    let oldTripIds: string[] = [];

    data.forEach(({ id, type, title, cur }) => {
      let prev = cur;
      let course: number;
      const savedTrip = this.all[id];
      if (!!savedTrip) {
        oldTripIds.push(id);
        course = savedTrip.course;
        if (!isCoordinatesEqual(savedTrip.cur, cur, [0.00001, 0.00001])) {
          course = calcCourse(savedTrip.cur, cur);
          prev = savedTrip.cur;
        }
      } else {
        // new trip
        newTripIds.push(id);
        course = 135;
      }
      newAll[id] = new Trip(id, type, title, prev, cur, course);
      newAllIds.push(id);
    });
    this.all = newAll;
    this.allIds = newAllIds;
    return [oldTripIds, newTripIds];
  }

  toJson() {
    return `[${Object.keys(this.all)
      .map((key) => this.all[key].toJson(false))
      .join(",")}]`;
  }

  get length() {
    return this.allIds.length;
  }

  getById(id) {
    return this.all[id];
  }

  getBounded(bounds: IVec) {
    return Object.keys(this.all)
      .filter((key) => isPntInBounds(this.all[key].cur, bounds))
      .map((key) => this.all[key]);
  }

  getSelected(trips: Trip[], selected: IBusRoutes) {
    if (!selected) return trips;
    return trips.filter(
      (trip) =>
        (selected.tbus.includes(trip.title) && trip.type === "tbus") ||
        (selected.bus.includes(trip.title) && trip.type === "bus")
    );
  }

  removeId(id: string): string {
    this.allIds = this.allIds.filter((idx) => idx !== id);
    delete this.all[id];
    return id;
  }
}

export default new Trips();
