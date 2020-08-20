import { polygon, booleanDisjoint } from '@turf/turf/turf.js';
import pathTransform from './pathTransform.js';
import concaveman from 'concaveman';

export default function concaveCross(polyline1, polyline2, offset) {
  let polygone1 = polygon([concaveman(pathTransform(polyline1, offset), 2, 0)]);
  let polygone2 = polygon([concaveman(pathTransform(polyline2, offset), 2, 0)]);
  return !booleanDisjoint(polygone1, polygone2);
}
