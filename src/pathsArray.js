import * as paths from './paths.json';
import polylineDistance from './polylineDistance';
import * as crossArrayFull from './crossArray.json';
import distance from './distance.js';
import Queue from 'tiny-queue';

export default function pathsArray(
  currentPos = null,
  destination = null,
  pathsUpdated = null,
  crossArrayUpdated = null,
  devices = null,
  choice = null
) {
  if (pathsUpdated)
    if (crossArrayUpdated)
      if (distance(currentPos, destination) < 0.3)
        return 'You should get there on foot';

  if (currentPos == null || destination == null)
    return 'Some of the parameters are missing';

  if (distance(currentPos, destination) > 60.0)
    return "You can't get there using busses";

  paths.features[paths.features.length - 1].polyline = paths.features[
    paths.features.length - 1
  ].polyline.slice(
    0,
    paths.features[paths.features.length - 1].polyline.lastIndexOf(' ')
  );

  let devicesList = [];
  for (let i = 0; i < devices.length; i++)
    devicesList[devices[i].device_id] = {
      device_id: devices[i].device_id,
      device_Name: devices[i].device_Name,
      lat: Number(devices[i].lat),
      lng: Number(devices[i].lon),
    };

  const devicesArray = devicesList.reduce((acc, entry, i) => {
    acc[entry.device_id] = entry;
    return acc;
  }, {});
  let pathArr;
  if (!pathsUpdated) pathArr = paths.features;
  else pathArr = pathsUpdated;

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
  let crossArray;
  if (!crossArrayUpdated) crossArray = crossArrayFull.default;
  else crossArray = crossArrayUpdated;

  for (const id in workingDictionary) {
    workingDictionary[id].crosses = crossArray[Number(id) - 1]
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
  const workingArray = workingDictionary;
  let firstPathArray = [];
  i = 0;
  for (const id in workingArray) {
    if (polylineDistance(currentPos, workingArray[id].polyline).dist < 0.2)
      firstPathArray.push(id);
    i++;
  }
  const length = i;

  function findPath(path1 = null) {
    let queue = new Queue();
    let solutions = [];
    let coefficient = choice == 'proximity' ? 1 : 2;
    let maxLength = 7;
    let pathsAccessed1 = {};
    for (const id in workingArray) pathsAccessed1[id] = false;
    path1.forEach((e) => {
      queue.push({
        path: [e],
        pathsAccessed: pathsAccessed1,
        startPos: {
          lat: polylineDistance(currentPos, workingArray[e].polyline).lat,
          lng: polylineDistance(currentPos, workingArray[e].polyline).lng,
        },
      });
    });

    while (queue.length > 0) {
      let currentNode = queue.shift();
      let path = currentNode.path;
      let pathsAccessed = currentNode.pathsAccessed;
      let startPos = currentNode.startPos;
      if (path.length > maxLength + coefficient || path.length > 7) continue;
      const lastPath = path[path.length - 1];
      let destDevice = {
        lat: Number(
          devicesArray[workingArray[lastPath].Path_destination_device_id].lat
        ),
        lng: Number(
          devicesArray[workingArray[lastPath].Path_destination_device_id].lng
        ),
      };

      let dist1 = distance(startPos, destination);
      let dist2 = distance(destDevice, destination);
      let dist3 = distance(destDevice, startPos);
      if (
        dist1 < 0.3 ||
        dist2 < 0.3 ||
        (workingArray[lastPath].close_to_finish && dist2 <= dist3)
      ) {
        maxLength = path.length < maxLength ? path.length : maxLength;
        solutions.push(path);
        continue;
      }
      if (workingArray[lastPath].close_to_finish && dist2 > dist3) continue;

      let t = lastPath;

      while (pathsAccessed[t] === false) {
        pathsAccessed[t] = true;
        let opposite = workingArray[t].hasOpposite;
        t = opposite !== false ? opposite : t;
      }

      let crossList = [];
      workingArray[lastPath].crosses.forEach((e) => {
        if (!pathsAccessed[e]) crossList.push(e);
      });

      let i = 0;
      l = crossList.length;
      for (i in crossList) {
        let pathPoints = workingArray[lastPath].polyline.split(' ');
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

        queue.push({
          path: path.concat(crossList[i]),
          pathsAccessed: pathsAccessed,
          startPos: newStartPos,
        });
      }
    }
    return solutions;
  }

  if (firstPathArray.length > 0) {
    let finalAnswer = findPath(firstPathArray);
    if (Array.isArray(finalAnswer) && finalAnswer.length > 0)
      return finalAnswer;
    else return "You can't get there using busses";
  }
  return "You can't get there using busses";
}
