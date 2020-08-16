import React from 'react';
import Switch from '../../../../components/Switch';
import Graph from '../../../../components/Graph';
import './style.css';

class SimOutcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      graphData: [
        ['Lose 2:1', 4],
        ['Lose 1:1', 32],
        ['Push', 9],
        ['Win 1:1', 28],
        ['Win 3:2', 2],
        ['Win 2:1', 9]
      ]
    };
  }

  onUpdate(data) {
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
        if(frequency[1] / max >= 0) {
          graphData.push(frequency);
        }
      });
    }
    graphData.sort((a, b) => {
      return a[3] > b[3];
    });

    this.setState({
      graphData
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

    let graphData2 = [
      ['$0', .33],
      ['$500', .40],
      ['100 hands', .27]
    ];

    return <div id='simOutcome'>
      <div id='simOutcomeHeader'>
        <button id='clearButton' onClick={this.onClear.bind(this)}>Clear</button>
        <Switch enabled={false} large={true} onChange={this.onToggle.bind(this)} />
      </div>
      <Graph data={graphData}/>
      <Graph data={graphData2}/>
    </div>
  }
}

export default SimOutcome;
