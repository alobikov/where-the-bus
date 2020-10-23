export default class Interval {
  private interval;
  constructor(private cb: any, private delay: number) {
    console.log("creating interval", delay);
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

export class PollStopsLt {
  private static subscribers = [];
  private static counter = 0;
  private static interval: Interval;
  private static _instance: PollStopsLt;
  private constructor() {}
  public static instance(cb, delay = 5000): PollStopsLt {
    if (!PollStopsLt._instance) {
      PollStopsLt._instance = new PollStopsLt();
      PollStopsLt.interval = new Interval(cb, delay);
    }
    PollStopsLt.counter++;
    return PollStopsLt._instance;
  }
  public getSubscribers() {
    return PollStopsLt.subscribers;
  }
  public subscribe(socket) {
    PollStopsLt.subscribers.push(socket);
    PollStopsLt.subscribers.length === 1 && PollStopsLt.interval.start();
  }
  public unsubscribe(socket) {
    PollStopsLt.subscribers = PollStopsLt.subscribers.filter(
      (s) => s !== socket
    );
    PollStopsLt.subscribers.length === 0 && PollStopsLt.interval.stop();
  }
}
