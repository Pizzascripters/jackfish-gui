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
    this.simCreated = false;
  }

  updateEngine(params) {
    let jackfish = this.state.jackfish;
    jackfish.setParams(params);
  }

  onUpdate(options) {
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

  onEnable() {
    if(this.simCreated) {
      this.sim.run();
    }
  }

  render() {
    return <div id='simulation'>
      <Parameters
        updateEngine={this.updateEngine.bind(this)}
      />
      <SimOutcome
        jackfish={this.state.jackfish}
        onEnable={this.onEnable.bind(this)}
      />
      <SimRules
        onUpdate={this.onUpdate.bind(this)}
      />
    </div>
  }
}

export default Simulation;
