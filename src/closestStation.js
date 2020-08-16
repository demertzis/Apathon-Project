import * as paths from './paths.json'
import polylineDistance from './polylineDistance'

export default function (currentPos = null, polyline = null) {
  if (!currentPos)  return null;
  /*call webservice 7
  let arr =;
  let minPath = {
    dist: polylineDistance(destination, arr[0].polyline),
    pathId: 1
  }

  let i = 0;
  let l = arr.length;
  for (; i < l; i++) {
    let x = polylineDistance(
      this.state.destination,
      arr[i].polyline
    );
    minPath = minPath.dist.dist > x.dist ? { dist: x, pathId: i } : minPath;
  }
  return minPath;*/
}