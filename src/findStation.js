import * as paths from './paths.json';
import polylineDistance from './polylineDistance.js';
import pathsArray from './pathsArray';
import axios from 'axios';

export default async function findStation(
  currentPos = null,
  destination = null,
  pathsArr = null,
  crossArray = null,
  devices = null,
  choice = null
) {
  if (!currentPos || !destination || !choice)
    return 'error: Some of the parameters are missing';
  if (!devices)
    return (
      'error: The device data is corrupted or missing please ' +
      ' refresh and try again'
    );
  let viablePaths = pathsArray(
    currentPos,
    destination,
    pathsArr,
    crossArray,
    devices,
    choice
  );
  if (!Array.isArray(viablePaths)) throw viablePaths;
  console.log('The viable paths are: ');
  console.log(viablePaths);
  function findMinLength() {
    let minLength = viablePaths[0].length;
    viablePaths.forEach((element) => {
      if (element.length < minLength) minLength = element.length;
    });
    return minLength;
  }

  let length = findMinLength();

  let pathsList;
  if (!pathsArr) pathsList = paths.features;
  else pathsList = pathsArr;
  const pathsDictionary = pathsList.reduce((acc, entry, i) => {
    acc[entry.Path_id] = entry;
    return acc;
  }, {});

  if (choice === 'proximity') {
    let candidatePaths = viablePaths.filter((e) => e.length <= length + 1);
    let closestPath = polylineDistance(
      currentPos,
      pathsDictionary[candidatePaths[0][0]].polyline
    );
    let answer = candidatePaths[0];
    candidatePaths.forEach((e) => {
      let candidate = polylineDistance(
        currentPos,
        pathsDictionary[e[0]].polyline
      );
      if (
        candidate.dist + 0.1 < closestPath.dist ||
        (candidate.dist < closestPath.dist + 0.1 && e.length < answer.length)
      )
        answer = e;
    });
    return answer;
  } else if (choice === 'covid') {
    let temp;
    await axios
      .get(
        'http://feed.opendata.imet.gr:23577/itravel/' +
          'trajectories_per_hour.json' +
          '?offset0&limit=10000',
        {
          timeout: 10000,
        }
      )
      .then(
        (resp) => {
          temp = resp;
        },
        (error) => {
          temp = error;
        }
      )
      .catch((error) => {
        console.log(error);
        throw error;
      });
    console.log(temp);
    if (temp.status == 200) {
      let trajectories = temp.data;
      let devices = {};
      trajectories.forEach((entry) => {
        if (!devices[entry.itravel_id]) devices[entry.itravel_id] = 1;
        else devices[entry.itravel_id]++;
      });
      let count = 0;
      for (const id in devices) count++;
      let candidatePaths = viablePaths.filter((e) => e.length <= length + 2);
      let answer = candidatePaths[0];

      function computeTotalTrajectories(pathList = []) {
        let sum = 0;
        pathList.forEach((entry) => {
          let temp = devices[pathsDictionary[entry].Path_origin_device_id];
          if (temp) sum += temp / (10000 / count);
        });
        debugger;
        return sum;
      }

      candidatePaths.forEach((entry) => {
        debugger;
        if (computeTotalTrajectories(answer) > computeTotalTrajectories(entry))
          answer = entry;
      });
      return answer;
    } else
      throw (
        'there has been a problem with the retrieval of trajectory' +
        ' data from imet, please try again later'
      );
  }
}
