import { deadIntervalSec } from "../config";

type Pos = [number, number];

export function incLngLat(lngLat, stepXY) {
  return [lngLat[0] + stepXY[0], lngLat[1] + stepXY[1]];
}

export function calcStepSize(vector, numOfSteps) {
  const result = [vector[0] / numOfSteps, vector[1] / numOfSteps];
  // console.log(result);
  return result;
}

// create vector from old and new coordinates
export function makeVector(prevPos: Pos, curPos: Pos): Pos {
  return [curPos[0] - prevPos[0], curPos[1] - prevPos[1]];
}

// calculate course angle in degrees from old and new coordinates
export function calcCourse(prevPos: Pos, curPos: Pos) {
  return Math.atan2(...makeVector(prevPos, curPos)) * (180 / Math.PI);
}

// test vector angle
// console.log(calcCourse([0, 0], [1, 1]));
// console.log(calcCourse([0, 0], [-1, -1]));

export function isCoordinatesEqual(prev, cur, stepSizeXY) {
  const [res1, res2] = makeVector(prev, cur);
  // console.log(Math.abs(res1), Math.abs(res2));
  return Math.abs(res1) < Math.abs(stepSizeXY[0]) &&
    Math.abs(res2) < Math.abs(stepSizeXY[1])
    ? true
    : false;
}

export function calcIsDead(updatedAt: number, timeNow: number): boolean {
  return updatedAt + 1000 * deadIntervalSec < timeNow;
}

export const isPntInBounds = (lngLat, bounds) => {
  const [lb, tr] = bounds;
  const [x1, y1] = lb;
  const [x2, y2] = tr;
  const [x, y] = lngLat;
  return x > x1 && x < x2 && y > y1 && y < y2;
};

// let lngLat = [1,5]
// let bounds = [[0,0],[10,8]]
// console.log(isPntInBounds(lngLat, bounds))
// lngLat = [2,5]
// bounds = [[0,0],[1,8]]
// console.log(isPntInBounds(lngLat, bounds))
