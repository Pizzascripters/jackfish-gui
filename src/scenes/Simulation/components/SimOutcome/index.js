import React from 'react';
import Switch from '../../../../components/Switch';
import Graph from '../../../../components/Graph';
import './style.css';

class SimOutcome extends React.Component {
  constructor(props) {
    super(props);
    this.createSimulation();
  }

  createSimulation() {
    // this.props.jackfish.createSimulation();
  }

  render() {
    let graphData = [
      ['Lose 2:1', 4],
      ['Lose 1:1', 32],
      ['Push', 9],
      ['Win 1:1', 28],
      ['Win 3:2', 2],
      ['Win 2:1', 9]
    ];

    let graphData2 = [
      ['$0', .33],
      ['$500', .40],
      ['100 hands', .27]
    ];

    return <div id='simOutcome'>
      <div id='simOutcomeHeader'>
        <button id='clearButton'>Clear</button>
        <Switch enabled={false} large={true} />
      </div>
      <Graph data={graphData}/>
      <Graph data={graphData2}/>
    </div>
  }
}

export default SimOutcome;
