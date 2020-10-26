import Interval from "../utils/interval";

export default class PollService {
  private static subscribers = [];
  private static counter = 0;
  private static interval: Interval;
  private static _instance: PollService;
  private constructor() {}
  public static instance(cb, delay = 5000): PollService {
    if (!PollService._instance) {
      PollService._instance = new PollService();
      PollService.interval = new Interval(cb, delay);
    }
    PollService.counter++;
    return PollService._instance;
  }
  public getSubscribers() {
    return PollService.subscribers;
  }
  public subscribe(socket) {
    PollService.subscribers.push(socket);
    PollService.subscribers.length === 1 && PollService.interval.start();
  }
  public unsubscribe(socket) {
    PollService.subscribers = PollService.subscribers.filter(
      (s) => s !== socket
    );
    PollService.subscribers.length === 0 && PollService.interval.stop();
  }
}
