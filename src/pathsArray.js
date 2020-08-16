import * as paths from './paths.json'
import polylineDistance from './polylineDistance'
import * as devices from './devices.json'
import concaveCross from './concaveCross'
// import { point, bearing } from '@turf/turf'
import distance from './distance.js'

import { polygon, booleanDisjoint } from '@turf/turf/turf.js'
import pathTransform from './pathTransform.js'
import concaveman from 'concaveman'


// export function removePaths(currentPos, destination, pathEndPoint) {
//   let point1 = point([Number(currentPos.lat), Number(currentPos.lng)]);
//   let point2 = point([Number(destination.lat), Number(destination.lng)]);
//   let point3 = point([Number(pathEndPoint.lat), Number(pathEndPoint.lng)]);

//   return Math.abs(bearing(point1, point2) - bearing(point1, point3)) >= 120;
// }

export default function pathsArray(currentPos = null, destination = null, offset = 0.05) {
  if (distance(currentPos, destination) < 0.3)
    return "You should get there on foot";

  if (currentPos == null || destination == null)
    return null;

  if (distance(currentPos, destination) > 60.0)
    return "You can't get there using busses";


  let devicesArray = [];
  for (let i = 0; i < devices.features.length; i++)
    devicesArray[devices.features[i].device_id] = {
      device_id: devices.features[i].device_id,
      device_Name: devices.features[i].device_Name,
      lat: Number(devices.features[i].lat),
      lng: Number(devices.features[i].lon)
    };

  let workingArray = paths.features.filter(path => (
    distance(currentPos, {
      lat: Number(path.polyline.slice(0, path.polyline.indexOf(' ')).split(',')[1]),
      lng: Number(path.polyline.slice(0, path.polyline.indexOf(' ')).split(',')[0])
    }) < 40.0
    //  && (!removePaths(currentPos, destination, devicesArray[path.Path_destination_device_id]) ||
    //  distance(currentPos, {
    //   lat: Number(path.polyline.slice(0, path.polyline.indexOf(' ')).split(',')[1]),
    //   lng: Number(path.polyline.slice(0, path.polyline.indexOf(' ')).split(',')[0])
    // }) < 0.2)
  )).map(s =>
    ({
      Path_id: s.Path_id,
      Path_Name: s.Path_Name,
      Path_origin_device_id: s.Path_origin_device_id,
      Path_destination_device_id: s.Path_destination_device_id,
      polyline: s.polyline,
      close_to_finish: (polylineDistance(destination, s.polyline).dist < 0.2),
      hasOpposite: false
    }));

  let i = 0;
  let j = 0;
  let l = workingArray.length;


  let crossArray = new Array(workingArray.length).fill(new Array(workingArray.length));

  for (; i < l; i++) {
    j = 0;
    debugger
    for (; j < l; j++) {
      if (!(typeof(crossArray[i][j]) === "boolean")) {
        let cross = concaveCross(workingArray[i].polyline, workingArray[j].polyline, offset);
        crossArray[i][j] = cross ? true : false;
        crossArray[j][i] = cross ? true : false;
      }
    }
  }

  debugger
  i = 0;

  for (; i < l; i++) {
    let j = i + 1;
    for (; j < l; j++)
      if (workingArray[i].Path_origin_device_id ==
        workingArray[j].Path_destination_device_id &&
        workingArray[j].Path_origin_device_id ==
        workingArray[i].Path_destination_device_id) {
        workingArray[i].hasOpposite = j;
        workingArray[j].hasOpposite = i;
      }
  }

  let firstPathArray = []
  i = 0;
  for (; i < l; i++)
    if (polylineDistance(currentPos, workingArray[i].polyline).dist < 0.3)
      firstPathArray.push(i);

  let pathsAccessed = new Array(workingArray.length);

  function findPath(path = null, startPos = null, offset = 0.05) {
    let polygone1 = polygon([concaveman(pathTransform(workingArray[path[path.length - 1]].polyline, offset), 2, 0)]);
    // alert(JSON.stringify(polygone1));

    if (!path)
      return null;

    if (path.length > 7)
      return null;

    let destDevice = {
      lat: Number(devicesArray[workingArray[path[path.length - 1]].Path_destination_device_id].lat),
      lng: Number(devicesArray[workingArray[path[path.length - 1]].Path_destination_device_id].lng)
    }

    let dist1 = distance(startPos, destination);
    let dist2 = distance(destDevice, destination);
    let dist3 = distance(destDevice, startPos);

    if (dist1 < 0.3 ||
      dist2 < 0.3 ||
      (workingArray[path[path.length - 1]].close_to_finish &&
        (dist2 <=
          dist3)))
      return path;
    if (workingArray[path[path.length - 1]].close_to_finish &&
      dist2 >
      dist3)
      return null;

    let i = 0;
    l = workingArray.length;

    // function getNewPathsAccessed(pathToAdd = null) {
    //   let newPathsAccessed = pathsAccessed;
    //   if (!newPathsAccessed.includes(pathToAdd))
    //     newPathsAccessed.push(pathToAdd);
    //   let possibleOpposite = workingArray[pathToAdd].hasOpposite;
    //   if (possibleOpposite !== false) {
    //     if (!newPathsAccessed.includes(possibleOpposite))
    //       newPathsAccessed.push(possibleOpposite);
    //     if (!newPathsAccessed.includes(workingArray[possibleOpposite].hasOpposite))
    //       newPathsAccessed.push(workingArray[possibleOpposite].hasOpposite);
    //   }
    //   return newPathsAccessed;
    // }

    pathsAccessed[path[path.length - 1]] = true;
    let possibleOpposite = workingArray[path[path.length - 1]].hasOpposite;
    if (possibleOpposite !== false) {
      pathsAccessed[possibleOpposite] = true;
      pathsAccessed[workingArray[possibleOpposite].hasOpposite] = true;
    }

    // pathsAccessed = getNewPathsAccessed(path[path.length - 1]);

    i = 0;
    l = workingArray.length;
    let crossList = [];

    // if (!Array.isArray(crossArray[i])) {
    //   crossArray[path[path.length - 1]] = new Array(workingArray.length);
    //   i = 0;
    //   for (; i < l; i++)
    //     crossArray[path[path.length - 1]][i] =
    //       concaveCross(workingArray[path[path.length - 1]].polyline, workingArray[i].polyline, offset) ?
    //         true : false
    // }

    i = 0;
    for (; i < l; i++)
      if (
        i != path[path.length - 1] &&
        // !pathsAccessed.includes(i) &&
        !pathsAccessed[i] &&
        crossArray[path[path.length - 1]][i]
      )
        l = crossList.length;

    i = 0;
    for (; i < l; i++) {
      let pathPoints = workingArray[path[path.length - 1]].polyline.split(' ');
      let newStartPos = polylineDistance(startPos, workingArray[crossList[i]].polyline);
      let j = newStartPos.pointId;
      let l2 = pathPoints.length;

      for (; j < l2; j++) {
        let point = {
          lat: Number(pathPoints[j].split(',')[1]),
          lng: Number(pathPoints[j].split(',')[0])
        }
        let candidateStartPos = polylineDistance(point, workingArray[crossList[i]].polyline);
        newStartPos = newStartPos.dist > candidateStartPos.dist ?
          candidateStartPos :
          newStartPos;
        if (newStartPos.dist < 0.1)
          break;
      }

      if (newStartPos.dist > 0.1) {

        crossList.splice(i, 1);
        l--;
        i--;
        continue;
      }

      let newPath = path.concat([crossList[i]]);
      // let newPathsAccessed = pathsAccessed;
      let pathContinuation = findPath(newPath, {
        lat: newStartPos.lat,
        lng: newStartPos.lng
      }, offset);

      if (Array.isArray(pathContinuation))
        return pathContinuation;
      else
        continue;
    }

    return null;
  }



  let finalAnswer = [];
  //let pathsAccessed = new Array(workingArray.length).fill(false);
  if (firstPathArray.length > 0) {
    let i = 0;
    let l = firstPathArray.length;
    for (; i < l; i++) {
      pathsAccessed.fill(false);

      let test = findPath([firstPathArray[i]], {
        lat: polylineDistance(currentPos, workingArray[firstPathArray[i]].polyline).lat,
        lng: polylineDistance(currentPos, workingArray[firstPathArray[i]].polyline).lng
      }, 0.1);

      if (Array.isArray(test))
        finalAnswer.push(test.map(x => Number(workingArray[x].Path_id)));
    }
    if (Array.isArray(finalAnswer) &&
      finalAnswer.length > 0)
      return finalAnswer;
  }

  return "You can't get there using busses";
}
