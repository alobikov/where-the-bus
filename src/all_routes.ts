import { IAllRoutes, ITripCollection } from "./types/types";
import { sort } from "./utils/sort";

// AllRoutes should support lazy initialization
export default class AllRoutes {
  private props: IAllRoutes;

  get allTypes(): IAllRoutes {
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
