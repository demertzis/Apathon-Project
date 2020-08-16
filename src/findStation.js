import * as devices from './devices.json';
import * as paths from './paths.json';
import distance from './distance.js';
import polylineDistance from './polylineDistance.js';
import closestStation from './closestStation.js';

export default function findStation(
  currentPos = null,
  destination = null,
  choice = null
) {
  if (!currentPos || !destination || !choice)
    return 'error: Some of the parameters are missing';

  let arr = paths.features;
  let minPath = {
    dist: polylineDistance(destination, arr[0].polyline),
    pathId: 1,
  };

  for (let i = 0; i < arr.length; i++) {
    let x = polylineDistance(destination, arr[i].polyline);
    minPath = minPath.dist.dist > x.dist ? { dist: x, pathId: i } : minPath;
  }
  /*  if (choice == "proximity")
    let x = closestStation(currentPos, );


    let distanceArr = devices.features.map(x => ({
      id: x.device_id,
      dist: distance(
        destination.lat,
        destination.lng,
        x.lat,
        x.lon
      )
    }));
    
    let pathDistanceArr = pahts.features.map(x => ({
      id: x.Path_Id,
      polyline: x.polyline
    })
    )
    let x = distanceArr[0];
    let i = 0;
    let l = distanceArr.length;
  
    for (; i < l; i++)
      x = distanceArr[i].dist < x.dist ? distanceArr[i] : x;
    
  if (x.dist > 1.0)
    x = "Ο προορισμός σας απέχει πολύ απ'τη πλησιέστερη στάση"
  return x;*/
}
