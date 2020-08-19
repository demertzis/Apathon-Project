import axios from 'axios';

export default function requests(type, responseFunction) {
  let arr = [];
  const baseUrl = 'http://feed.opendata.imet.gr:23577/itravel/';

  // let res = await axios.get(baseUrl + type + '?offset=500&limit=500', {
  //   timeout: 20,
  // });
  // return res.data;
  axios
    .get(baseUrl + type + '?offset=0&limit=500', {
      timeout: 10000,
    })
    .then(
      (response) => {
        console.log(response);
        responseFunction(response);
        return;
      },
      (error) => {
        console.log(error);
        responseFunction(error);
        return;
      }
    );
}
