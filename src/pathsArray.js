import * as paths from './paths.json';
import polylineDistance from './polylineDistance';
import * as devices from './devices.json';
import * as crossArrayFull from './crossArray.json';
// import concaveCross from './concaveCross';
// import { point, bearing } from '@turf/turf'
import distance from './distance.js';

import { polygon, booleanDisjoint } from '@turf/turf/turf.js';
import pathTransform from './pathTransform.js';
import concaveman from 'concaveman';

// export function removePaths(currentPos, destination, pathEndPoint) {
//   let point1 = point([Number(currentPos.lat), Number(currentPos.lng)]);
//   let point2 = point([Number(destination.lat), Number(destination.lng)]);
//   let point3 = point([Number(pathEndPoint.lat), Number(pathEndPoint.lng)]);

//   return Math.abs(bearing(point1, point2) - bearing(point1, point3)) >= 120;
// }

export default function pathsArray(
  currentPos = null,
  destination = null,
  offset = 0.05
) {
  if (distance(currentPos, destination) < 0.3)
    return 'You should get there on foot';

  if (currentPos == null || destination == null) return null;

  if (distance(currentPos, destination) > 60.0)
    return "You can't get there using busses";

  paths.features[227].polyline += ',40.63076';

  let devicesArray = [];
  for (let i = 0; i < devices.features.length; i++)
    devicesArray[devices.features[i].device_id] = {
      device_id: devices.features[i].device_id,
      device_Name: devices.features[i].device_Name,
      lat: Number(devices.features[i].lat),
      lng: Number(devices.features[i].lon),
    };

  devicesArray.reduce((acc, entry, i) => {
    acc[entry.device_id] = entry;
    return acc;
  }, {});

  let pathArr = paths.features;
  let i = 0;
  let j = 0;
  let l = pathArr.length;
  let workingDictionary = [];
  let queue = [];
  for (; i < l; i++)
    if (
      distance(currentPos, {
        lat: Number(
          pathArr[i].polyline
            .slice(0, pathArr[i].polyline.indexOf(' '))
            .split(',')[1]
        ),
        lng: Number(
          pathArr[i].polyline
            .slice(0, pathArr[i].polyline.indexOf(' '))
            .split(',')[0]
        ),
      }) < 40.0
    ) {
      workingDictionary.push(pathArr[i]);
      queue.push(true);
    } else queue.push(false);

  workingDictionary = workingDictionary.reduce((acc, entry, i) => {
    acc[entry.Path_id] = entry;
    return acc;
  }, {});

  for (const id in workingDictionary) {
    workingDictionary[id].close_to_finish =
      polylineDistance(destination, workingDictionary[id].polyline).dist < 0.3;
    workingDictionary[id].hasOpposite = false;
    for (const id2 in workingDictionary) {
      if (
        workingDictionary[id].Path_origin_device_id ==
          workingDictionary[id2].Path_destination_device_id &&
        workingDictionary[id].Path_destination_device_id ==
          workingDictionary[id2].Path_origin_device_id
      ) {
        workingDictionary[id].hasOpposite = id2;
        if (Number(id) < Number(id2)) break;
      }
      if (
        workingDictionary[id].hasOpposite !== false &&
        id > workingDictionary[id].hasOpposite
      )
        for (const id3 in workingDictionary) {
          if (
            workingDictionary[id].Path_origin_device_id ==
              workingDictionary[id3].Path_destination_device_id &&
            workingDictionary[id].Path_destination_device_id ==
              workingDictionary[id3].Path_origin_device_id
          ) {
            workingDictionary[id].hasOpposite = id3;
            break;
          }
        }
    }
  }

  let crossArray = [];
  for (const id in workingDictionary) {
    workingDictionary[id].crosses = crossArrayFull.default[Number(id) - 1]
      .reduce((acc, entry, i) => {
        if (entry === true) {
          acc.push((i + 1).toString());
          return acc;
        } else return acc;
      }, [])
      .filter(
        (x) =>
          workingDictionary[x].Path_origin_device_id !=
            workingDictionary[id].Path_origin_device_id &&
          workingDictionary[x].Path_destination_device_id !=
            workingDictionary[id].Path_destination_device_id &&
          workingDictionary[x].Path_destination_device_id !=
            workingDictionary[id].Path_origin_device_id
      );
  }
  let len = workingDictionary.length;
  const workingArray = workingDictionary;

  // let crossArray = {};
  // for (const id in workingArray)
  //   crossArray[id] = ((x) => {
  //     crossArray[x] = [];
  //     crossArrayFull[x - 1].forEach((elem, index, array) => {
  //       if (elem === true) crossArray[x].push(index + 1);
  //       return;
  //     });
  //   })(id);

  // let crossArray = [];
  // i = 0;
  // l = pathArr.length;
  // for (; i < l; i++) {
  //   if (!queue[i]) continue;
  //   else {
  //     crossArray.push([]);
  //     j = 0;
  //   }
  //   for (; j < l; j++)
  //     if (queue[j])
  //       crossArray[crossArray.length - 1].push(crossArrayFull.default[i][j]);
  // }
  // i = 0;
  // l = crossArray.length;
  // let crossArrayList = [];
  // for (; i < l; i++) {
  //   j = 0;
  //   crossArrayList.push([]);
  //   for (; j < l; j++)
  //     if (j != i && crossArray[i][j]) crossArrayList[i].push(j);
  // }
  // crossArray = [];
  // i = 0;
  // for (; i < l; i++) {
  //   crossArray.push([]);
  //   crossArray[i] = crossArrayList[i].filter(
  //     (x) =>
  //       workingArray[x].Path_origin_device_id !=
  //         workingArray[i].Path_origin_device_id &&
  //       workingArray[x].Path_destination_device_id !=
  //         workingArray[i].Path_destination_device_id &&
  //       workingArray[x].Path_destination_device_id !=
  //         workingArray[i].Path_origin_device_id
  //   );
  // }
  // let crossArrayPathId = crossArray.map((x) =>
  //   x.map((y) => Number(workingArray[y].Path_id))
  // );
  // let crossArrayListPathId = crossArrayList.map((x) =>
  //   x.map((y) => Number(workingArray[y].Path_id))
  // );
  // // devicesArray.reduce((acc, entry, i) => {
  // //   acc[entry.device_id] = entry;
  // //   return acc;
  // // }, {});
  // crossArrayPathId = crossArrayPathId.reduce((acc, entry, i) => {
  //   acc[workingArray[i].Path_id] = entry;
  //   return acc;
  // }, {});
  // crossArrayListPathId = crossArrayListPathId.reduce((acc, entry, i) => {
  //   acc[workingArray[i].Path_id] = entry;
  //   return acc;
  // }, {});
  // debugger;
  let firstPathArray = [];
  i = 0;
  for (const id in workingArray) {
    if (polylineDistance(currentPos, workingArray[id].polyline).dist < 0.2)
      firstPathArray.push(id);
    i++;
  }

  const length = i;

  let pathsAccessed = new Array(length);

  function findPath(path = null, startPos = null, offset = 0.05) {
    if (!path) return null;

    if (path.length > 7) return null;

    let destDevice = {
      lat: Number(
        devicesArray[
          workingArray[path[path.length - 1]].Path_destination_device_id
        ].lat
      ),
      lng: Number(
        devicesArray[
          workingArray[path[path.length - 1]].Path_destination_device_id
        ].lng
      ),
    };

    let dist1 = distance(startPos, destination);
    let dist2 = distance(destDevice, destination);
    let dist3 = distance(destDevice, startPos);

    if (
      dist1 < 0.3 ||
      dist2 < 0.3 ||
      (workingArray[path[path.length - 1]].close_to_finish && dist2 <= dist3)
    ) {
      console.log(
        path.map((x) => ({
          id: workingArray[x].Path_id,
          origin: workingArray[x].Path_origin_device_id,
        }))
      );
      return path;
    }
    if (workingArray[path[path.length - 1]].close_to_finish && dist2 > dist3)
      return null;

    let i = 0;
    l = workingArray.length;
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
    l = crossArray[path[path.length - 1]].length;
    for (; i < l; i++) {
      let candidatePath = crossArray[path[path.length - 1]][i];
      if (!pathsAccessed.includes(candidatePath)) crossList.push(candidatePath);
    }
    // for (; i < l; i++)
    //   if (
    //     i != path[path.length - 1] &&
    //     // !pathsAccessed.includes(i) &&
    //     !pathsAccessed[i] &&
    //     crossArray[path[path.length - 1]][i]
    //   )
    //     crossList.push(i);

    l = crossList.length;

    i = 0;
    for (; i < l; i++) {
      let pathPoints = workingArray[path[path.length - 1]].polyline.split(' ');
      let newStartPos = polylineDistance(
        startPos,
        workingArray[crossList[i]].polyline
      );
      let j = newStartPos.pointId;
      let l2 = pathPoints.length;

      for (; j < l2; j++) {
        let point = {
          lat: Number(pathPoints[j].split(',')[1]),
          lng: Number(pathPoints[j].split(',')[0]),
        };
        let candidateStartPos = polylineDistance(
          point,
          workingArray[crossList[i]].polyline
        );
        newStartPos =
          newStartPos.dist > candidateStartPos.dist
            ? candidateStartPos
            : newStartPos;
        if (newStartPos.dist < 0.1) break;
      }

      if (
        newStartPos.dist > 0.1 ||
        distance(
          newStartPos,
          devicesArray[workingArray[crossList[i]].Path_destination_device_id]
        ) < 0.1
      ) {
        crossList.splice(i, 1);
        l--;
        i--;
        continue;
      }

      let newPath = path.concat([crossList[i]]);
      // let newPathsAccessed = pathsAccessed;
      let pathContinuation = findPath(
        newPath,
        {
          lat: newStartPos.lat,
          lng: newStartPos.lng,
        },
        offset
      );

      if (Array.isArray(pathContinuation)) return pathContinuation;
      else continue;
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

      let test = findPath(
        [firstPathArray[i]],
        {
          lat: polylineDistance(
            currentPos,
            workingArray[firstPathArray[i]].polyline
          ).lat,
          lng: polylineDistance(
            currentPos,
            workingArray[firstPathArray[i]].polyline
          ).lng,
        },
        0.1
      );

      if (Array.isArray(test))
        finalAnswer.push(test.map((x) => Number(workingArray[x].Path_id)));
    }
    if (Array.isArray(finalAnswer) && finalAnswer.length > 0)
      return finalAnswer;
  }

  return "You can't get there using busses";
}
