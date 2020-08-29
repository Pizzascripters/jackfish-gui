import React from 'react';
import Jackfish from '../../lib/main.js';
import Parameters from '../../components/Parameters';
import SimOutcome from './components/SimOutcome';
import SimRules from './components/SimRules';
import './style.css';

class Simulation extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selection: null, jackfish: new Jackfish() };
    this.simCreated = false;
  }

  updateEngine(params) {
    let jackfish = this.state.jackfish;
    jackfish.setParams(params);
  }

  onUpdateRules(options) {
    for(let rule of options.rules) {
      delete rule.onChange;
    }
    if(this.simCreated) {
      this.state.jackfish.updateSimulation(options);
    } else {
      this.state.jackfish.createSimulation(options);
      this.simCreated = true;
    }
  }

  render() {
    return <div id='simulation'>
      <Parameters
        updateEngine={this.updateEngine.bind(this)}
      />
      <SimOutcome
        jackfish={this.state.jackfish}
      />
      <SimRules
        onUpdate={this.onUpdateRules.bind(this)}
      />
    </div>
  }
}

export default Simulation;
