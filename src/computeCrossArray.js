import { polygon, booleanDisjoint } from '@turf/turf/turf.js';
import pathTransform from './pathTransform.js';
import concaveman from 'concaveman';

export default function computeCrossArray(paths) {
  const workingArray = paths;

  const offset = 0.05;
  let i = 0;
  let j = 0;
  let l = workingArray.length;
  let polygonArray = {};
  for (; i < l; i++)
    polygonArray[i] = polygon([
      concaveman(pathTransform(workingArray[i].polyline, offset), 2, 0),
    ]);

  const polygonDictionary = polygonArray;

  i = 0;
  let crossArray = new Array(workingArray.length);
  for (; i < l; i++) {
    crossArray[i] = new Array(workingArray.length);
    crossArray[i][i] = true;
  }

  i = 0;
  for (; i < l; i++) {
    j = 0;
    for (; j < l; j++) {
      if (!(typeof crossArray[i][j] === 'boolean')) {
        let cross = !booleanDisjoint(
          polygonDictionary[i],
          polygonDictionary[j],
          offset
        );
        crossArray[i][j] = cross ? true : false;
        crossArray[j][i] = cross ? true : false;
      }
    }
  }
  return crossArray;
}
