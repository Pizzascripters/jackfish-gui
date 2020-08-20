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
    this.boxes = [];
    for(let i = 0; i < 5; i++) this.boxes.push({ai: false, difficulty: 'Basic Strategy'})
    this.cash = 1000;
    this.minimum = 10;
  }

  updateEngine(params) {
    let jackfish = this.state.jackfish;
    jackfish.setParams(params);
  }

  onChangeSetup(setup) {
    this.boxes = setup.boxes;
    this.cash = setup.cash;
    this.minimum = setup.minimum;
  }

  render() {
    return <div id='practice'>
      <Parameters
        updateEngine={this.updateEngine.bind(this)}
      />
      <Game />
      <div className='section'>
        <Tabs names={['Setup', 'Analysis']} renderTab={(i) => {
          if(i === 0) {
            return <GameSetup
              onChange={this.onChangeSetup.bind(this)}
              boxes={this.boxes}
              cash={this.cash}
              minimum={this.minimum}
            />;
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
