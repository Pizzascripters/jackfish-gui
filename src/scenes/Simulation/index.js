import React from 'react';
import Main from '../../lib/main.js';
import Parameters from '../../components/Parameters';
import SimOutcome from './components/SimOutcome';
import SimRules from './components/SimRules';
import './style.css';

class Simulation extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selection: null };
    this.main = null;
    this.simCreated = false;
  }

  updateEngine(params) {
    let main = this.main;
    if(!main) {
      this.main = new Main(params);
    } else {
      main.jackfish.setParams(params);
    }
  }

  onUpdateRules(options) {
    for(let rule of options.rules) {
      delete rule.onChange;
    }
    if(this.simCreated) {
      window.jackfish.updateSimulation(options);
    } else {
      window.jackfish.createSimulation(options);
      this.simCreated = true;
    }
  }

  render() {
    return <div id='simulation'>
      <Parameters
        updateEngine={this.updateEngine.bind(this)}
      />
      <SimOutcome />
      <SimRules
        onUpdate={this.onUpdateRules.bind(this)}
      />
    </div>
  }
}

export default Simulation;
