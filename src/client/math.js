export function incLngLat(lngLat, stepXY) {
  return [lngLat[0] + stepXY[0], lngLat[1] + stepXY[1]];
}

export function calcStepSize(vector, numOfSteps) {
  const result = [vector[0] / numOfSteps, vector[1] / numOfSteps];
  return result;
}

// create vector from old and new coordinates
export function makeVector(prevPos, curPos) {
  return [curPos[0] - prevPos[0], curPos[1] - prevPos[1]];
}

// calculate course angle in degrees from old and new coordinates
export function calcCourse(prevPos, curPos) {
  return Math.atan2(...makeVector(prevPos, curPos)) * (180 / Math.PI);
}

// test vector angle
// console.log(calcCourse([0, 0], [1, 1]));
// console.log(calcCourse([0, 0], [-1, -1]));

export function isCoordinatesEqual(prev, cur, stepSizeXY) {
  const [res1, res2] = makeVector(prev, cur);
  return Math.abs(res1) < Math.abs(stepSizeXY[0]) &&
    Math.abs(res2) < Math.abs(stepSizeXY[1])
    ? true
    : false;
}

const convert = (float) => Math.round(float * 1000000);
export function convertToInt({ _ne, _sw }) {
  return [
    [convert(_sw.lng), convert(_sw.lat)],
    [convert(_ne.lng), convert(_ne.lat)],
  ];
}

const convertToString = (n) =>
  parseFloat(String(n).slice(0, 2) + "." + String(n).slice(2));
export function intPosToDeg([lng, lat]) {
  return [convertToString(lng), convertToString(lat)];
}

export function isBigJump(prev, cur, jumpSizeLimit) {
  const [x, y] = makeVector(prev, cur);
  const length = Math.sqrt(x * x + y * y);
  // length > jumpSizeLimit && console.log(length);
  return length > jumpSizeLimit;
}
