export default class Interval {
  private interval;
  constructor(private cb: any, private delay: number) {
    console.log("creating interval ms:", delay);
  }

  start() {
    console.log("interval started");
    this.interval = setInterval(this.cb, this.delay);
  }

  stop() {
    console.log("interval stopped");
    clearInterval(this.interval);
  }

  get isActive() {
    return !this.interval._destroyed;
  }
}
