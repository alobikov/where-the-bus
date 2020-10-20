import Trip from "./trip";
import {
  calcCourse,
  calcIsDead,
  isPntInBounds,
  isCoordinatesEqual,
} from "./math";

export default class allTrips {
  private trips: Record<string, Trip> = {}; // {'1234': Trip_instance,....}
  private allIds: string[] = [];
  private addIds: string[] = [];
  private removedIds: string[] = [];

  set(data) {
    // drop isAlive for all
    // this.allIds.forEach((id) => (this.trips[id].isAlive = false));

    const timeNow = Date.now();
    data.forEach(({ id, type, title, lngLat }) => {
      if (!this.trips[id]) {
        // new trip addition
        this.trips[id] = new Trip(id, type, title, lngLat, timeNow, -135);
        this.allIds.push(id);
        if (this.removedIds.includes(id)) console.log("returning id:", id);
      } else {
        // existing trip update
        this.trips[id].isAlive = true;
        this.trips[id].title = title;
        this.trips[id].type = type;
        const prevPos = this.trips[id].lngLat;
        if (isCoordinatesEqual(prevPos, lngLat, [0.00001, 0.00001])) {
          const updatedAt = this.trips[id].updatedAt;
          this.trips[id].isDead = calcIsDead(updatedAt, timeNow);
        } else {
          this.trips[id].isDead = false;
          this.trips[id].course = calcCourse(prevPos, lngLat);
          this.trips[id].lngLat = lngLat;
        }
        this.trips[id].updatedAt = timeNow;
      }
    });
    //remove not alive trips
    // this.allIds = this.allIds.filter((id) => {
    //   if (this.trips[id].isAlive) return true;
    //   if (calcIsDead(this.trips[id].updatedAt, timeNow)) {
    //     delete this.trips[id];
    //     this.removedIds.push(id);
    //     const matchingIds = this.removedIds.filter((id) =>
    //       this.addIds.includes(id)
    //     );
    //     console.log(
    //       `Deleting not alive trip id: ${id}; Total trips now: ${this.allIds.length}`
    //     );
    //     return false;
    //   }
    //   return true;
    // });

    // it would be nice to set course now
  }

  toJson() {
    return `[${Object.keys(this.trips)
      .map((key) => this.trips[key].toJson())
      .join(",")}]`;
  }

  get length() {
    return this.trips.length;
  }

  getById(id) {
    return this.trips[id];
  }

  getBounded(bounds) {
    return Object.keys(this.trips)
      .filter((key) => isPntInBounds(this.trips[key].lngLat, bounds))
      .map((key) => this.trips[key]);
  }
}
