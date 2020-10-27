import { deadIntervalSec } from "../config";
import { IVec, IPos } from "../types/types";

export function incLngLat(lngLat, stepXY) {
  return [lngLat[0] + stepXY[0], lngLat[1] + stepXY[1]];
}

export function calcStepSize(vector, numOfSteps) {
  const result = [vector[0] / numOfSteps, vector[1] / numOfSteps];
  return result;
}

// create vector from old and new coordinates
export function makeVector(prevPos: IPos, curPos: IPos): IPos {
  return [curPos[0] - prevPos[0], curPos[1] - prevPos[1]];
}

// calculate course angle in degrees from old and new coordinates
export function calcCourse(prevPos: IPos, curPos: IPos) {
  return Math.atan2(...makeVector(prevPos, curPos)) * (180 / Math.PI);
}

export function isCoordinatesEqual(prev, cur, stepSizeXY) {
  const [res1, res2] = makeVector(prev, cur);
  return Math.abs(res1) < Math.abs(stepSizeXY[0]) &&
    Math.abs(res2) < Math.abs(stepSizeXY[1])
    ? true
    : false;
}

export function calcIsDead(updatedAt: number, timeNow: number): boolean {
  return updatedAt + 1000 * deadIntervalSec < timeNow;
}

export const isPntInBounds = (lngLat: IPos, bounds: IVec) => {
  const [lb, tr] = bounds;
  const [x1, y1] = lb;
  const [x2, y2] = tr;
  const [x, y] = lngLat;
  return x > x1 && x < x2 && y > y1 && y < y2;
};

export const convertToUptime = (sec): string => {
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec / (60 * 60)) % 24);
  const minutes = Math.floor((sec / 60) % 60);
  return ` ${days} day(s) ${hours} hour(s) ${minutes} minute(s)`;
};
