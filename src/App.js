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

  const markers = positions.map((position, i) => (
    <Marker key={i} coords={stringCoords[position[0] - 1][position[1]]}/>
  ));

  return (
    <div className="fretboard" style={{position: 'relative'}}>
    {markers}
    </div>
  );
}

function getAllPositionsOfScale(scale) {
  const allPositions = _.flatten(_.range(1, 7).map((string) => (
    _.range(0, 22).map((fret) => (
      [string, fret]
    ))
  )));

  return allPositions.filter(([string, fret]) => {
    return scale.includes(getNote(string, fret))
  });
}

function getScale(key, scaleName) {
  const C_SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    naturalMinor: [0, 2, 3, 5, 7, 8, 10]
  };

  const DISTANCE_FROM_C = {
    'A♭': 8,
    'A': 9,
    'B♭': 10,
    'B': 11,
    'C': 0,
    'D♭': 1,
    'D': 2,
    'E♭': 3,
    'E': 4,
    'F': 5,
    'G♭': 6,
    'G': 7
  };

  const scale = C_SCALES[scaleName];
  const distanceFromC = DISTANCE_FROM_C[key];
  const transposedScale = scale.map((note) => ((note + distanceFromC) % 12 ));
  return transposedScale;
}

function getNote(string, fret) {
  const TUNING = {
    1: 4,
    2: 11,
    3: 7,
    4: 2,
    5: 9,
    6: 4
  };
  return (TUNING[string] + fret) % 12;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      key: 'C',
      scale: 'major'
    };

    this.updateScale = this.updateScale.bind(this);
    this.updateKey = this.updateKey.bind(this);
  }

  updateScale(scale) {
    this.setState({ scale });
  }

  updateKey(key) {
    this.setState({ key });
  }

  render() {
    const scale = getScale(this.state.key, this.state.scale);
    const positions = getAllPositionsOfScale(scale);
    return (
      <div className="App">
        <br/>
        <div style={{textAlign: 'center'}}>
          <Fretboard positions={positions} />
          <br/>
          <label>
          Key:
          <select value={this.state.key} onChange={(e) => this.updateKey(e.target.value)}>
            <option value="A♭">A♭</option>
            <option value="A">A</option>
            <option value="B♭">B♭</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D♭">D♭</option>
            <option value="D">D</option>
            <option value="E♭">E♭</option>
            <option value="E">E</option>
            <option value="F">F</option>
            <option value="G♭">G♭</option>
            <option value="G">G</option>
          </select>
          </label>
          <label>
          Scale:
          <select value={this.state.scale} onChange={(e) => this.updateScale(e.target.value)}>
            <option value="major">Major</option>
            <option value="mixolydian">Mixolydian</option>
            <option value="naturalMinor">Natural Minor</option>
          </select>
        </label>
        </div>
      </div>
    );
  }
}

export default App;
