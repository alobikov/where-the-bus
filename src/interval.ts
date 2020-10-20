export default class Interval {
  private interval;
  constructor(private cb: any, private delay: number) {}

  start() {
    this.interval = setInterval(this.cb, this.delay);
  }

  stop() {
    clearInterval(this.interval);
  }

  get isActive() {
    return !this.interval._destroyed;
  }
}
