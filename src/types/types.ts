export interface IBusRoutes {
  bus: string[];
  tbus: string[];
}

export interface ITripCollection {
  id: string;
  type: string;
  title: string;
  cur: [number, number];
}

export interface IStateRecord {
  ids?: string[];
  bounds?: [[number, number], [number, number]];
  selected?: IBusRoutes;
}

export type IPos = [number, number];
export type IVec = [IPos, IPos];

export type StateProps = {};
