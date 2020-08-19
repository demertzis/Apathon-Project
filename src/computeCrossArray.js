import concaveCross from './concaveCross';

export default function computeCrossArray(paths) {
  const workingArray = paths;

  const offset = 0.05;
  let i = 0;
  let j = 0;
  let l = workingArray.length;

  let crossArray = new Array(workingArray.length);
  for (; i < l; i++) {
    crossArray[i] = new Array(workingArray.length);
    crossArray[i][i] = true;
  }

  i = 0;

  for (; i < l; i++) {
    j = 0;
    for (; j < l; j++) {
      if (!(typeof crossArray[i][j] === 'boolean')) {
        let cross = concaveCross(
          workingArray[i].polyline,
          workingArray[j].polyline,
          offset
        );
        crossArray[i][j] = cross ? true : false;
        crossArray[j][i] = cross ? true : false;
      }
    }
  }
  return crossArray;
}
