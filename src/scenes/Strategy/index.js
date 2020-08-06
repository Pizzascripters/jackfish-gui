import React from 'react';
import Count from '../../lib/Count.js';
import Jackfish from '../../lib/Jackfish';
import Parameters from './components/Parameters';
import Table from './components/Table';
import Analysis from './components/Analysis';
import './style.css';

class Strategy extends React.Component {
  constructor(props) {
    super(props);
    let jackfish = new Jackfish({
      count: new Count('hilo', 0, 1),
      soft17: true,
      surrender: 'none',
      doubleAfterSplit: true
    });
    let table = jackfish.getTable();
    this.state = { jackfish, table, selection: null };

    let sim = jackfish.createSimulation([2, 2], 3, 'P');
    console.log(sim.run(100000));
  }

  updateEngine(params) {
    let jackfish = this.state.jackfish;
    jackfish.setParams(params);
    this.setState({ jackfish });
  }

  onSelect(player, dealer) {
    this.setState({
      selection: [player, dealer]
    });
  }

  render() {
    return <div id='strategy'>
      <Parameters
        jackfish={this.state.jackfish}
        updateEngine={this.updateEngine.bind(this)}
      />
      <Table
        jackfish={this.state.jackfish}
        onSelect={this.onSelect.bind(this)}
      />
      <Analysis
        jackfish={this.state.jackfish}
        selection={this.state.selection}
      />
    </div>
  }
}

export default Strategy;
