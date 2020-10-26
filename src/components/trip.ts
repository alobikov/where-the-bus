import { minStep } from "../config";
import { isCoordinatesEqual } from "../utils/math";

export default class Trip {
  constructor(
    public id: string,
    public type: string,
    public title: string,
    public prev: [number, number],
    public cur: [number, number],
    public course: number //course is latched and never reset
  ) {}
  toJson(isAdd: boolean) {
    if (isAdd) {
      return JSON.stringify({
        id: this.id,
        title: this.title,
        type: this.type,
        cur: this.cur,
        course: this.course,
      });
    } else {
      return JSON.stringify({
        id: this.id,
        cur: this.cur,
        course: this.course,
      });
    }
  }
}

// toJson(withPrev: boolean = true) {
//   return withPrev
//     ? JSON.stringify({
//         id: this.id,
//         type: this.type,
//         title: this.title,
//         lngLat: this.cur,
//         prevLngLat: this.prev,
//       })
//     : JSON.stringify({
//         id: this.id,
//         type: this.type,
//         title: this.title,
//         lngLat: this.cur,
//       });
// }
