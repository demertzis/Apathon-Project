import * as paths from './paths.json';
import polylineDistance from './polylineDistance';
import * as devices from './devices.json';
import * as crossArrayFull from './crossArray.json';
import distance from './distance.js';

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
  const workingArray = workingDictionary;
  let crossArray = [];
  let firstPathArray = [];
  i = 0;
  for (const id in workingArray) {
    if (polylineDistance(currentPos, workingArray[id].polyline).dist < 0.2)
      firstPathArray.push(id);
    i++;
  }
  const length = i;

  function findPath(
    path = null,
    pathsAccessed = null,
    startPos = null,
    offset = 0.05
  ) {
    if (!path) return null;
    console.log(JSON.stringify(path));

    if (path.length > 10) return null;

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
      console.log(
        path.map((x) => ({
          id: workingArray[x].Path_id,
          origin: workingArray[x].Path_origin_device_id,
        }))
      );
      return path;
    }
    if (workingArray[lastPath].close_to_finish && dist2 > dist3) return null;

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

      let newPath = path.concat([crossList[i]]);
      let pathContinuation = findPath(
        newPath,
        pathsAccessed,
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
  if (firstPathArray.length > 0) {
    let i = 0;
    let l = firstPathArray.length;
    for (; i < l; i++) {
      let firstPath = [firstPathArray.pop()];
      let pathsAccessed = {};
      for (const id in workingArray) pathsAccessed[id] = false;
      let test = findPath(
        [firstPath],
        pathsAccessed,
        {
          lat: polylineDistance(currentPos, workingArray[firstPath].polyline)
            .lat,
          lng: polylineDistance(currentPos, workingArray[firstPath].polyline)
            .lng,
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
