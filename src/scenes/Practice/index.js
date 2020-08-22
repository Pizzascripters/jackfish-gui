import React from 'react';
import Jackfish from '../../lib/Jackfish';
import Game from './components/Game';
import GameSetup from './components/GameSetup';
import Parameters from '../../components/Parameters';
import Tabs from '../../components/Tabs';
import './style.css';

class Practice extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selection: null };
    this.jackfish = null;
    this.boxes = [];
    for(let i = 0; i < 5; i++) this.boxes.push({ai: false, difficulty: 'Basic Strategy'});
    this.cash = 1000;
    this.minimum = 10;
  }

  updateEngine(params) {
    let jackfish = this.jackfish;
    if(!jackfish) {
      this.jackfish = new Jackfish(params);
    } else {
      jackfish.setParams(params);
    }
  }

  onChangeSetup(setup) {
    this.boxes = setup.boxes;
    this.cash = setup.cash;
    this.minimum = setup.minimum;
    this.jackfish.setPracticeParams({
      boxes: this.boxes,
      cash: this.cash,
      minimum: this.minimum
    })
  }

  render() {
    return <div id='practice'>
      <Parameters
        updateEngine={this.updateEngine.bind(this)}
      />
      <Game />
      <div className='section' id='gameSetup'>
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

export default Practice;
