export default class Trip {
  constructor(
    public id: string,
    public type: string,
    public title: string,
    public prev: [number, number],
    public cur: [number, number],
    public course: number //course is latched and never reset
  ) {}
  toJson() {
    return JSON.stringify({
      id: this.id,
      title: this.title,
      type: this.type,
      prev: this.prev, // this prop helps at client side to add moving markers to the map
      cur: this.cur,
      course: this.course,
    });
  }
}
