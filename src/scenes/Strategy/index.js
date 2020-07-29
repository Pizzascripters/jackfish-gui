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
      count: new Count('none', 0, 1),
      soft17: true,
      surrender: 'none',
      doubleAfterSplit: true
    });
    let table = jackfish.getTable();
    this.state = { jackfish, table, selection: null };
  }

  updateEngine(params) {
    let jackfish = new Jackfish(params);
    let table = jackfish.getTable();
    this.setState({ jackfish, table });
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
        onSelect={this.onSelect.bind(this)}
        handStates={this.state.jackfish.getHandStates()}
        table={this.state.table}
      />
      <Analysis
        selection={this.state.selection}
      />
    </div>
  }
}

export default Strategy;
