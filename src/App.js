import React from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import { Icon } from 'leaflet';
import './App.css';
import * as paths from './paths.json';
import devices from './devices.json';
import ChoiceForm from './ChoiceForm.js';
import pathsArray from './pathsArray';
import requests from './requests';
import computeCrossArray from './computeCrossArray';

paths.features[227].polyline += ',40.63076';
// var sampleArr = [paths.features[60]];

export const busIcon = new Icon({
  iconUrl: '/bus.svg',
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
      walkingDistance: null,
      sampleArr: [],
      pathId: 1,
      pathsUpdated: null,
      crossArray: null,
    };
    this.setActiveStation = this.setActiveStation.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleResponse = this.handleResponse.bind(this);
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

  handleResponse(res) {
    if (res.status == 200) {
      let newPaths = res.data;
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

  handleRefreshRequest() {
    requests('paths.json', this.handleResponse);
  }

  handleSubmit(e) {
    this.setState({
      choice: e.preference,
      walkingDistance: e.walkingDistance,
      pathId: e.pathId,
    });

    if (this.state.currentPos && this.state.destination) {
      let pathsList;
      if (this.state.pathsUpdated && this.state.crossArray)
        pathsList = pathsArray(
          this.state.currentPos,
          this.state.destination,
          this.state.pathsUpdated,
          this.state.crossArray
        );
      else
        pathsList = pathsArray(this.state.currentPos, this.state.destination);

      if (Array.isArray(pathsList) && pathsList.length > 0) {
        let markerArray = [];
        for (let i = 0; i < pathsList[0].length; i++)
          markerArray.push(paths.features[pathsList[0][i] - 1]);

        this.setState({
          sampleArr: markerArray,
        });
      }
      alert(JSON.stringify(pathsList));
    }
  }

  /*
        alert(concaveCross(sampleArr[0].polyline, "" +
        Number(this.state.currentPos.lng) +
        "," +
        Number(this.state.currentPos.lat) +
        " " +
        Number(this.state.destination.lng) +
        "," +
        Number(this.state.destination.lat)
        ,
        0.2)
      );
   */

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

          {devices.features.map((station) => (
            <Marker
              key={station.device_id}
              position={[station.lat, station.lon]}
              onClick={() => {
                this.setActiveStation(station);
              }}
              icon={busIcon}
            />
          ))}

          {paths.features[this.state.pathId - 1].polyline
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
          {/* 
        {sampleArr.map(path => pathTransform(path.polyline, 0.1).split(' ').map(station => (
          <Marker
            position={[
              Number(station.split(',')[1]),
              Number(station.split(',')[0])
            ]
            }
          />
        )))
        } */}

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
        <ChoiceForm style={{ flex: 1 }} onClick={this.handleSubmit} />

        <input
          type="button"
          value="test-button"
          onClick={() => {
            if (
              window.confirm(
                'Are you sure you wish to refresh the crossings array? \n' +
                  'if you do, a GET request will be sent and then the app will freese for approximately 3 minutes while the new array is computed'
              )
            )
              this.handleRefreshRequest();
            return;
          }}
        />
      </div>
    );
  }
}
export default App;
