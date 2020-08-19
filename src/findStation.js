import * as devices from './devices.json';
import * as paths from './paths.json';
import polylineDistance from './polylineDistance.js';
import requests from './requests.js';
import pathsArray from './pathsArray';
import axios from 'axios';

export default async function findStation(
  currentPos = null,
  destination = null,
  pathsArr = null,
  crossArray = null,
  choice = null
) {
  if (!currentPos || !destination || !choice)
    return 'error: Some of the parameters are missing';
  let viablePaths = pathsArray(currentPos, destination, pathsArr, crossArray);
  if (!Array.isArray(viablePaths)) throw viablePaths;

  function findMinLength() {
    let minLength = viablePaths[0].length;
    viablePaths.forEach((element) => {
      if (element.length < minLength) minLength = element.length;
    });
    return minLength;
  }

  let pathsDictionary;
  if (!pathsArr) pathsDictionary = paths.features;
  else pathsDictionary = pathsArr;
  pathsDictionary.reduce((acc, entry, i) => {
    acc[entry.Path_id] = entry;
    return acc;
  }, {});

  if (choice === 'proximity') {
    let length = findMinLength();
    let candidatePaths = viablePaths.filter((e) => e.length == length);
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
      if (candidate.dist < closestPath.dist) answer = e;
    });
    return answer;
  } else if (choice === 'covid') {
    let temp;
    let trajectories = [];
    let offset = 0;
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
      );
    console.log(temp);
    if (temp.status == 200) {
      let trajectories = temp.data;
      let devices = {};
      trajectories.forEach((entry) => {
        if (!devices[entry.itravel_id]) devices[entry.itravel_id] = 1;
        else devices[entry.itravel_id]++;
      });
      let answer = viablePaths[0];

      function computeTotalTrajectories(pathList = []) {
        let sum = 0;
        pathList.forEach((entry) => {
          let temp = devices[pathsDictionary[entry].Path_origin_device_id];
          if (temp) sum += temp;
          return sum;
        });
      }

      viablePaths.forEach((entry) => {
        if (computeTotalTrajectories(answer) < computeTotalTrajectories[entry])
          answer = entry;
      });
      return answer;
    } else
      return (
        'there has been a problem with the retrieval of trajectory' +
        ' data from imet, please try again later'
      );
  }
}
