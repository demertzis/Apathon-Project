import React from 'react';
import { Map, Marker, Popup, TileLayer, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import './App.css';
import * as paths from './paths.json';
import ChoiceForm from './ChoiceForm.js';
import PathIdForm from './PathIdForm.js';
import computeCrossArray from './computeCrossArray';
import findStation from './findStation.js';
import axios from 'axios';

export const busIcon = new Icon({
  iconUrl: '/bus-stop-pointer.svg',
  iconSize: [38, 35],
});

export const destinationIcon = new Icon({
  iconUrl: '/destinationIcon.svg',
  iconSize: [60, 60],
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeStation: null,
      currentPos: null,
      destination: null,
      flag: true,
      choice: null,
      sampleArr: [],
      pathId: null,
      pathsUpdated: null,
      crossArray: null,
      devices: [],
      lastAnswer: [],
    };
    this.setActiveStation = this.setActiveStation.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePathSubmit = this.handlePathSubmit.bind(this);
    this.handleRefreshRequest = this.handleRefreshRequest.bind(this);
  }

  setActiveStation(e) {
    this.setState({
      activeStation: e,
    });
  }

  handleClick(e) {
    if (this.state.flag) {
      this.setState({
        currentPos: e.latlng,
      });

      this.setState({
        destination: null,
      });
    } else {
      this.setState({
        destination: e.latlng,
      });
    }
    this.setState({
      flag: !this.state.flag,
    });
  }

  async handleRefreshRequest() {
    let temp;
    await axios
      .get(
        'http://feed.opendata.imet.gr:23577/itravel/' +
          'paths.json' +
          '?offset=0&limit=500',
        {
          timeout: 10000,
        }
      )
      .then(
        (resp) => {
          temp = resp;
          console.log(resp);
        },
        (error) => {
          temp = error;
        }
      )
      .catch((error) => {
        alert(
          'there was an error downloading the data from imet, please try again later'
        );
        console.log(error);
      });
    if (temp.status == 200) {
      let newPaths = temp.data;
      newPaths[newPaths.length - 1].polyline = newPaths[
        newPaths.length - 1
      ].polyline.slice(
        0,
        newPaths[newPaths.length - 1].polyline.lastIndexOf(' ')
      );
      this.setState({
        pathsUpdated: newPaths,
      });
      if (
        window.confirm(
          'Paths data have been downloaded succesfully, ' +
            'press OK to start computing the crossings array. ' +
            "The process will take a few minutes so you'll have to " +
            'make sure the browser does not stop ' +
            '(press wait if yellow bar appears)'
        )
      ) {
        let newCrossArray = computeCrossArray(newPaths);
        alert('The cross array has been computed succesfully');
        this.setState({
          crossArray: newCrossArray,
        });
      }
    } else
      alert(
        'there was an error downloading the data from imet, please try again later'
      );
  }

  handlePathSubmit(e) {
    this.setState({
      pathId: e.pathId,
    });
  }

  handleSubmit(e) {
    this.setState({
      choice: e.preference,
      walkingDistance: e.walkingDistance,
      pathId: e.pathId,
    });
    if (this.state.currentPos && this.state.destination && e.preference) {
      findStation(
        this.state.currentPos,
        this.state.destination,
        this.state.pathsUpdated,
        this.state.crossArray,
        this.state.devices,
        e.preference
      )
        .then((resp) => {
          this.setState({
            lastAnswer: resp,
          });
          alert(resp);
        })
        .catch((error) => {
          console.log(error);
          if (typeof error === 'string') alert(error);
          else alert('An error occured: ' + error + '. Pls try again.');
        });
    } else alert('some of the parameters are missing');
  }

  componentDidMount() {
    console.log(
      'The application should be up and running. If you want to refresh the' +
        ' paths data and consequently the path intersections tap the button ' +
        'on the bottom left. Be advised though, this process will freeze the ' +
        'applicaton for approximately a minute'
    );
    let errorMessage =
      'There was an error downloading devices data. ' +
      'You can only show paths with the second option, if you want to ' +
      'use the main function of the app please refresh';
    axios
      .get(
        'http://feed.opendata.imet.gr:23577/itravel/' +
          'devices.json' +
          '?offset=0&limit=500',
        {
          timeout: 10000,
        }
      )
      .then(
        (resp) => {
          if (resp.status == 200) {
            this.setState({
              devices: resp.data,
            });
            console.log(resp);
            alert(' Devices data have been downloaded succesfully');
          } else alert(errorMessage);
        },
        (error) => {
          alert(errorMessage);
          console.log(error);
        }
      )
      .catch((error) => {
        alert(errorMessage);
        console.log(error);
      });
  }

  render() {
    return (
      <div>
        <Map
          style={{ flex: 1 }}
          center={[40.640064, 22.94442]}
          zoom={15}
          onClick={this.handleClick}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            PARK
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />

          {this.state.devices &&
            this.state.devices.map((station) => (
              <Marker
                key={station.device_id}
                position={[station.lat, station.lon]}
                onClick={() => {
                  this.setActiveStation(station);
                }}
                icon={busIcon}
              />
            ))}

          {this.state.pathId &&
            paths.features[this.state.pathId - 1].polyline
              .split(' ')
              .map((station) => (
                <Marker
                  position={[
                    Number(station.split(',')[1]),
                    Number(station.split(',')[0]),
                  ]}
                />
              ))}

          {/*{paths.features[41].polyline.split(' ').map(station => (      */}
          {this.state.sampleArr.map((path) =>
            path.polyline
              .split(' ')
              .map((station) => (
                <Marker
                  position={[
                    Number(station.split(',')[1]),
                    Number(station.split(',')[0]),
                  ]}
                />
              ))
          )}
          {this.state.pathsUpdated &&
            this.state.lastAnswer.map((path) => {
              return (
                <Polyline
                  positions={this.state.pathsUpdated[path - 1].polyline
                    .split(' ')
                    .map((x) => [
                      Number(x.split(',')[1]),
                      Number(x.split(',')[0]),
                    ])}
                  weight={6}
                  color={'red'}
                />
              );
            })}

          {!this.state.pathsUpdated &&
            this.state.lastAnswer.map((path) => {
              return (
                <Polyline
                  positions={paths.features[path - 1].polyline
                    .split(' ')
                    .map((x) => [
                      Number(x.split(',')[1]),
                      Number(x.split(',')[0]),
                    ])}
                  weight={6}
                  color={'red'}
                />
              );
            })}

          {this.state.activeStation && (
            <Popup
              position={[
                this.state.activeStation.lat,
                this.state.activeStation.lon,
              ]}
              onClose={() => {
                this.setActiveStation(null);
              }}
            >
              <div>
                <h2>{this.state.activeStation.device_Name}</h2>
                <p>{this.state.activeStation.device_id}</p>
              </div>
            </Popup>
          )}

          {this.state.currentPos && (
            <Marker position={this.state.currentPos} draggable={true}>
              <Popup position={this.state.currentPos}>
                Current location:{' '}
                <pre>{JSON.stringify(this.state.currentPos, null, 2)}</pre>
              </Popup>
            </Marker>
          )}

          {this.state.destination && (
            <Marker
              position={this.state.destination}
              draggable={true}
              icon={destinationIcon}
            >
              <Popup position={this.state.destination}>
                Destination:{' '}
                <pre>{JSON.stringify(this.state.destination, null, 2)}</pre>
              </Popup>
            </Marker>
          )}
        </Map>
        <ChoiceForm onClick={this.handleSubmit} />
        <PathIdForm onClick={this.handlePathSubmit} />

        <input
          type="button"
          value="Paths Refresh"
          onClick={() => {
            if (
              window.confirm(
                'Are you sure you wish to refresh the crossings array? \n' +
                  'if you do, a GET request will be sent and then the app will freese for approximately a minute while the new array is computed'
              )
            )
              this.handleRefreshRequest();
            return;
          }}
          style={{ position: 'absolute', right: 10, bottom: 20 }}
        />
      </div>
    );
  }
}
export default App;
