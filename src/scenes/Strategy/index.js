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
    this.state = {jackfish: new Jackfish({
      count: new Count('none', 0, 1),
      soft17: true,
      surrender: 'none',
      doubleAfterSplit: true
    })}
  }

  updateEngine(params) {
    this.setState({
      jackfish: new Jackfish(params)
    });
  }

  render() {
    return <div id='strategy'>
      <Parameters jackfish={this.state.jackfish} updateEngine={this.updateEngine.bind(this)}/>
      <Table jackfish={this.state.jackfish}/>
      <Analysis />
    </div>
  }
}

export default Strategy;
