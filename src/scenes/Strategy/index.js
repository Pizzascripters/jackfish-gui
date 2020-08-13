import React from 'react';
import Jackfish from '../../lib/Jackfish';
import Parameters from '../../components/Parameters';
import Table from './components/Table';
import Analysis from './components/Analysis';
import './style.css';

class Strategy extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selection: null, jackfish: new Jackfish() };
  }

  updateEngine(params) {
    let jackfish = this.state.jackfish;
    jackfish.setParams(params);
  }

  onSelect(player, dealer) {
    this.setState({
      selection: [player, dealer]
    });
  }

  onClear() {
    this.setState({
      selection: null
    });
  }

  doTable() {
    this.setState({
      table: this.state.jackfish.getTable()
    });
  }

  render() {
    return <div id='strategy'>
      <Parameters
        updateEngine={this.updateEngine.bind(this)}
      />
      <Table
        jackfish={this.state.jackfish}
        onSelect={this.onSelect.bind(this)}
        onClear={this.onClear.bind(this)}
      />
      <Analysis
        jackfish={this.state.jackfish}
        selection={this.state.selection}
      />
    </div>
  }
}

export default Strategy;
