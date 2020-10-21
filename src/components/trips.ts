import Trip from "./trip";
import { calcCourse, isPntInBounds, isCoordinatesEqual } from "../utils/math";

export class Trips {
  private all: Record<string, Trip> = {}; // {'1234': Trip_instance,....}
  private allIds: string[] = [];

  set(data) {
    // this.all = {};
    this.allIds = [];
    data.forEach(({ id, type, title, lngLat }) => {
      let course = 135;
      if (this.all[id]) {
        course = this.all[id].course;
        const prevLngLat = this.all[id].lngLat;
        course = isCoordinatesEqual(prevLngLat, lngLat, [0.00001, 0.00001])
          ? course
          : calcCourse(this.all[id].lngLat, lngLat);
      }
      this.all[id] = new Trip(id, type, title, lngLat, course);
      this.allIds.push(id);
    });
    Object.keys(this.all).forEach(
      (id) => !this.allIds.includes(id) && delete this.all[id]
    );
  }

  toJson() {
    return `[${Object.keys(this.all)
      .map((key) => this.all[key].toJson())
      .join(",")}]`;
  }

  get length() {
    return this.allIds.length;
  }

  getById(id) {
    return this.all[id];
  }

  getBounded(bounds) {
    return Object.keys(this.all)
      .filter((key) => isPntInBounds(this.all[key].lngLat, bounds))
      .map((key) => this.all[key]);
  }

  getSelected(trips, selected) {
    if (!selected) return trips;
    return trips.filter(
      (trip) =>
        (selected.tbus.includes(trip.title) && trip.type === "tbus") ||
        (selected.bus.includes(trip.title) && trip.type === "bus")
    );
  }

  removeId(id): string {
    this.allIds = this.allIds.filter((idx) => idx !== id);
    delete this.all[id];
    return id;
  }
}

export default new Trips();
