import * as turf from '@turf/turf/turf.js';

export default function distance(point1, point2) {
  return turf.distance(
    turf.point([Number(point1.lng), Number(point1.lat)]),
    turf.point([Number(point2.lng), Number(point2.lat)])
  );
}
