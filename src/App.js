import React, { Component } from 'react';
import * as _ from 'lodash';
import './App.css';
import distance from 'euclidean-distance';

/*
 * Position: a pair. [STRING, FRET] 
 * [1, 0] : first string, open fretting
 * [3, 4] : third string, fourth fret
 *
 */

function getFretPlacements(scaleLength, numFrets) {
  const ratio = 17.835;
  const result = [0, scaleLength / ratio];

  function nextFret() {
    const prevFret = result[result.length - 1];
    const bridgeToPrevFret = scaleLength - prevFret;
    result.push((bridgeToPrevFret / ratio) + prevFret);
  }

  _.times(numFrets - 1, nextFret);

  return result;
}

function getFretCoords(c1, c2, scaleLength, numFrets) {
  const fretPlacements = getFretPlacements(scaleLength, numFrets);
  const endPoint = _.last(fretPlacements);
  const fretCoords = fretPlacements.map((fp) => {
    const segmentRatio = fp / endPoint;
    return [
      ((1 - segmentRatio) * c1[0]) + (segmentRatio * c2[0]),
      ((1 - segmentRatio) * c1[1]) + (segmentRatio * c2[1])
    ];
  });
  return fretCoords;
}

function getFretMidpoints(fretCoords) {
  return fretCoords.map((coords, index) => {
    if (index === 0) return coords;
    const prevCoords = fretCoords[index - 1];
    return [
      ((0.5) * prevCoords[0]) + (0.5 * coords[0]),
      ((0.5) * prevCoords[1]) + (0.5 * coords[1])
    ];
  });
}

const Marker = ({coords}) => (
  <div className="marker" style={{left: `${coords[0]}%`, bottom: `${coords[1]}%`}}/>
);

const Fretboard = ({positions}) => {
  const numFrets = 21;
  const scaleLength = distance([3.8, 11], [69.6, 5]) * 2;
  const stringCoords = [
    getFretMidpoints(getFretCoords([3.8, 80], [96.4, 87], scaleLength, numFrets)),
    getFretMidpoints(getFretCoords([3.8, 67], [96.4, 71], scaleLength, numFrets)),
    getFretMidpoints(getFretCoords([3.8, 55.5], [96.4, 55], scaleLength, numFrets)),
    getFretMidpoints(getFretCoords([3.8, 43], [96.4, 38], scaleLength, numFrets)),
    getFretMidpoints(getFretCoords([3.8, 32], [96.4, 21], scaleLength, numFrets)),
    getFretMidpoints(getFretCoords([3.8, 19], [96.4, 5], scaleLength, numFrets))
  ];

  const markers = positions.map((position) => (
    <Marker coords={stringCoords[position[0] - 1][position[1]]}/>
  ));

  return (
    <div className="fretboard" style={{position: 'relative'}}>
    {markers}
    </div>
  );
}

const A_PENTATONIC = [
  [1, 5], [1, 8], [2, 5], [2,8], [3,5], [3,7], [4,5],  [4,7], [5,5], [5,7], [6, 5], [6,8]
];

const all = _.flatten(_.range(1, 7).map((string) => (
  _.range(0, 22).map((fret) => (
    [string, fret]
  ))
)));

class App extends Component {
  render() {
    return (
      <div className="App">
        <br/>
        <div style={{textAlign: 'center'}}>
          <Fretboard positions={A_PENTATONIC} />
        </div>
      </div>
    );
  }
}

export default App;
