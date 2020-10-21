import { IBusRoutes, ITripCollection } from "./types/types";
import { sort } from "./utils/sort";

// AllRoutes should support lazy initialization
class BusRoutes {
  private props: IBusRoutes;

  get allTypes(): IBusRoutes {
    return this.props;
  }
  toJson(): string {
    return JSON.stringify(this.props);
  }

  set(data: ITripCollection[]) {
    // Set() is used to store only unique route numbers
    const routes = { bus: new Set<string>(), tbus: new Set<string>() };
    data.forEach((chunk) => {
      const type = chunk.type;
      routes[type].add(chunk.title);
    });
    this.props = { bus: sort([...routes.bus]), tbus: sort([...routes.tbus]) };
  }
}

export default new BusRoutes();
