export default class Trip {
  constructor(
    public id: string,
    public type: string,
    public title: string,
    public lngLat: [number, number],
    public course: number
  ) {}
  toJson() {
    return JSON.stringify({
      id: this.id,
      type: this.type,
      title: this.title,
      lngLat: this.lngLat,
      course: this.course,
    });
  }
}
