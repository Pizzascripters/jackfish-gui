import React from 'react';
import Switch from '../../../../components/Switch';
import Graph from '../../../../components/Graph';
import {formatPercent} from '../../../../lib/lib.js';
import './style.css';

class SimOutcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      graphData: [],
      endingData: [],
      edge: 0
    };
  }

  onUpdate(data) {
    // Frequency graph data
    let uncutData = [];
    Object.keys(data.frequencies).forEach((key) => {
      key = Number(key);
      let text;
      if(key === 0) {
        text = 'Push';
      } else {
        let i = 1;
        while(Math.abs((key * i) % 1) > 1e-3 && i < 100) i++;
        text = `${Math.abs(key) * i}:${i}`;
      }
      if(key > 0) {
        text = `${text} win`;
      } else if(key < 0) {
        text = `${text} loss`;
      }
      let color;
      switch(key) {
        case -1:
          color = '#f88';
          break;
        case 0:
          color = '#fec';
          break;
        case 1:
          color = '#8f8';
          break;
        case 1.5:
          color = '#3f3';
          break;
        default:
      }
      if(!color && key > 0) {
        color = '#080';
      } else if(!color && key < 0) {
        color = '#800';
      }
      uncutData.push([text, data.frequencies[key], color, key]);
    });
    let graphData = [];
    if(uncutData.length > 0) {
      let max = uncutData.reduce((acc, x) => acc > x[1] ? acc : x[1]);
      uncutData.forEach((frequency, i) => {
        if(frequency[1] / max >= 1e-3) {
          graphData.push(frequency);
        }
      });
    }
    graphData.sort((a, b) => {
      return a[3] > b[3];
    });

    // Ending graph data
    let endingData = [];
    Object.keys(data.endRecord).forEach((key) => {
      let color;
      if(key === '$0') {
        color = '#c11';
      } else if(key.startsWith('$')) {
        color = '#1c1';
      }
      endingData.push([key, data.endRecord[key], color]);
    });
    endingData.sort((a, b) => {
      if(a[0] === '$0') {
        return false;
      } else if(b[0] === '$0') {
        return true;
      } else if(a[0].startsWith('$')) {
        return false;
      } else if(b[0].startsWith('$')) {
        return true;
      } else if(a[0].endsWith('hands')) {
        return false;
      }
      return false;
    });

    this.setState({
      graphData,
      endingData,
      edge: data.mean,
      hands: data.totalHands
    });
  }

  onToggle(enabled) {
    if(enabled) {
      this.props.jackfish.runSimulation(this.onUpdate.bind(this));
    } else {
      this.props.jackfish.stopSimulation(this.onUpdate.bind(this));
    }
  }

  onClear() {
    this.props.jackfish.clearSimulation(this.onUpdate.bind(this));
  }

  render() {
    let graphData = this.state.graphData;
    let endingData = this.state.endingData;

    return <div id='simOutcome'>
      <div id='simOutcomeHeader'>
        <button id='clearButton' onClick={this.onClear.bind(this)}>Clear</button>
        <Switch enabled={false} large={true} onChange={this.onToggle.bind(this)} />
      </div>
      <Graph data={graphData}/>
      <div id='handsPlayed'>{this.state.hands} hands played</div>
      <div id='playerEdge'>{formatPercent(this.state.edge, true)}</div>
      <Graph data={endingData}/>
    </div>
  }
}

export default SimOutcome;
