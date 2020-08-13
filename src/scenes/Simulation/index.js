import React from 'react';
import Jackfish from '../../lib/Jackfish';
import Parameters from '../../components/Parameters';
import SimOutcome from './components/SimOutcome';
import SimRules from './components/SimRules';
import './style.css';

class Simulation extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selection: null, jackfish: new Jackfish() };
  }

  updateEngine(params) {
    let jackfish = this.state.jackfish;
    jackfish.setParams(params);
  }

  render() {
    return <div id='simulation'>
      <Parameters
        updateEngine={this.updateEngine.bind(this)}
      />
      <SimOutcome />
      <SimRules />
    </div>
  }
}

export default Simulation;
