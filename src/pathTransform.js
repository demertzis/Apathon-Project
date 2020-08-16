import {
  point,
  destination,
  bearing,
  lineString,
  lineOffset,
} from '@turf/turf/turf.js';

export default function pathTransform(polyline = null, offset = 0.0) {
  if (!polyline) return null;
  let arr = polyline
    .split(' ')
    .map((x) => [Number(x.split(',')[0]), Number(x.split(',')[1])]);

  if (arr.length > 1) {
    let point1 = point([arr[arr.length - 2][0], arr[arr.length - 2][1]]);
    let point2 = point([arr[arr.length - 1][0], arr[arr.length - 1][1]]);
    let extendedPoint1 = destination(point2, 0.05, bearing(point1, point2));

    point1 = point([arr[1][0], arr[1][1]]);
    point2 = point([arr[0][0], arr[0][1]]);
    let extendedPoint2 = destination(point2, 0.05, bearing(point1, point2));

    arr.push(extendedPoint1.geometry.coordinates);
    arr.splice(0, 0, extendedPoint2.geometry.coordinates);
  }

  let line = lineString(arr);

  let offLine1 = lineOffset(line, offset, { units: 'kilometers' });
  let offLine2 = lineOffset(line, -offset, { units: 'kilometers' });

  return offLine1.geometry.coordinates.concat(offLine2.geometry.coordinates);
}
