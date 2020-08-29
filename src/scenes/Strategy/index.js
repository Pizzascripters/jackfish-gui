import React from 'react';
import Parameters from '../../components/Parameters';
import Table from './components/Table';
import Analysis from './components/Analysis';
import Main from '../../lib/main.js';
import './style.css';

class Strategy extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selection: null };
    this.main = null;
  }

  updateEngine(params) {
    let main = this.main;
    if(!main) {
      this.main = new Main(params);
    } else {
      this.main.jackfish.setParams(params, true);
    }
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
      table: window.jackfish.getTable()
    });
  }

  render() {
    return <div id='strategy'>
      <Parameters
        updateEngine={this.updateEngine.bind(this)}
      />
      <Table
        onSelect={this.onSelect.bind(this)}
        onClear={this.onClear.bind(this)}
      />
      <Analysis
        selection={this.state.selection}
      />
    </div>
  }
}

export default Strategy;
