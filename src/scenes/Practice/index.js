import React from 'react';
import Jackfish from '../../lib/Jackfish';
import Game from './components/Game';
import GameSetup from './components/GameSetup';
import Parameters from '../../components/Parameters';
import Tabs from '../../components/Tabs';
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

  render() {
    return <div id='practice'>
      <Parameters
        updateEngine={this.updateEngine.bind(this)}
      />
      <Game />
      <div class='section'>
        <Tabs names={['Setup', 'Analysis']} renderTab={(i) => {
          if(i === 0) {
            return <GameSetup />;
          } else if(i === 1) {
            return null;
          }
          return null;
        }} />
      </div>
    </div>
  }
}

export default Strategy;
