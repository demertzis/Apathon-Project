import distance from './distance.js'

export default function polylineDistance(point = null, polyline = null) {
  if (!point || !polyline)
    return "Some of the parameters are missing";
  let polyArr = polyline.split(' ');
  let minDist = {
    lat: Number(polyArr[0].split(',')[1]),
    lng: Number(polyArr[0].split(',')[0]),
    pointId: 0,
    dist: distance(
      point,
      {
        lat: Number(polyArr[0].split(',')[1]),
        lng: Number(polyArr[0].split(',')[0])
      }
    )
  }
  let i = 0;
  let l = polyArr.length;
  for (; i < l; i++) {
    let dist =
      distance(
        point,
        {
          lat: Number(polyArr[i].split(',')[1]),
          lng: Number(polyArr[i].split(',')[0])
        }
      )
    minDist = minDist.dist > dist ? {
      lat: Number(polyArr[i].split(',')[1]),
      lng: Number(polyArr[i].split(',')[0]),
      pointId: i,
      dist: dist
    }
      :
      minDist;
  }

  return minDist;
}