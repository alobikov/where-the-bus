export interface IAllRoutes {
  bus: string[];
  tbus: string[];
}

export interface ITripCollection {
  type: string;
  title: string;
  course?: number;
  lngLat: number[];
}
