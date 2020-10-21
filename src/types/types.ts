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
  selected?: { tbus: string[]; bus: string[] };
}

export type StateProps = Record<string, IStateRecord>;
