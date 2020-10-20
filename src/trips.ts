import Trip from "./trip";
import {
  calcCourse,
  calcIsDead,
  isPntInBounds,
  isCoordinatesEqual,
} from "./math";

export default class Trips {
  private all: Record<string, Trip> = {}; // {'1234': Trip_instance,....}
  private allIds: string[] = [];

  set(data) {
    const timeNow = Date.now();
    data.forEach(({ id, type, title, lngLat }) => {
      if (!this.all[id]) {
        // new trip addition
        this.all[id] = new Trip(id, type, title, lngLat, timeNow, -135);
        this.allIds.push(id);
      } else {
        // existing trip update
        // this.all[id].title = title;
        // this.all[id].type = type;
        const prevPos = this.all[id].lngLat;
        if (isCoordinatesEqual(prevPos, lngLat, [0.00001, 0.00001])) {
          const dead = calcIsDead(this.all[id].updatedAt, timeNow);
          // if (dead) console.log(id);
          this.all[id].isDead = dead;
        } else {
          this.all[id].isDead = false;
          this.all[id].course = calcCourse(prevPos, lngLat);
          this.all[id].lngLat = lngLat;
          this.all[id].updatedAt = timeNow;
        }
      }
    });
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

  getDead(): string[] {
    return this.allIds.filter((id) => this.all[id].isDead);
  }

  removeId(id): string {
    this.allIds = this.allIds.filter((idx) => idx !== id);
    delete this.all[id];
    return id;
  }

  removeDead(): string[] {
    const deadList = this.getDead();
    deadList.forEach((id) => this.removeId(id));
    return deadList;
  }

  removeOutdated(): string[] {
    const timeNow = Date.now();
    const outdatedIds = this.allIds.filter((id) =>
      calcIsDead(this.all[id].updatedAt, timeNow)
    );
    outdatedIds.forEach((id) => this.removeId(id));
    return outdatedIds;
  }
}
