export default class Trip {
  constructor(
    public id: string,
    public type: string,
    public title: string,
    public lngLat: [number, number],
    public updatedAt,
    public course: number,
    public isDead: boolean = false,
    public isAlive: boolean = true
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
