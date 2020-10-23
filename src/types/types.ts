export interface IBusRoutes {
  bus: string[];
  tbus: string[];
}

export interface ITripCollection {
  type: string;
  title: string;
  course?: number;
  lngLat: number[];
}

export interface IStateRecord {
  bounds?: [[number, number], [number, number]];
  selected?: IBusRoutes;
}

export type StateProps = {};
