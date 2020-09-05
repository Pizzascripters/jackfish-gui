import React from 'react';
import Dropdown from '../../../../components/Dropdown';
import Num from '../../../../components/Number';
import './style.css';

class GameSetup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.boxes = this.props.boxes;
    this.cash = this.props.cash;
    this.minimum = this.props.minimum;
    this.penetration = this.props.penetration;

    this.numBoxes = window.practice.getNumBoxes();
    window.practice.onNumBoxes = this.onNumBoxes.bind(this);
  }

  onChangeBox(i, state) {
    this.boxes[i] = state;
    this.onChange.bind(this)();
  }

  onChangeCash(value) {
    this.cash = value;
    this.onChange.bind(this)();
  }

  onChangeMinimum(value) {
    this.minimum = value;
    this.onChange.bind(this)();
  }

  onChangePenetration(value) {
    this.penetration = value;
    this.onChange.bind(this)();
  }

  onChange() {
    this.props.onChange({
      boxes: this.boxes,
      cash: this.cash,
      minimum: this.minimum,
      penetration: this.penetration
    })
  }

  onNumBoxes(numBoxes) {
    this.numBoxes = numBoxes;
    this.forceUpdate();
  }

  componentWillUnmount() {
    window.practice.onNumBoxes = null;
  }

  render() {
    this.onChange.bind(this)();
    return <div>
      {[0, 1, 2, 3, 4].map((n, i) => {
        if(n < this.numBoxes) {
          return <BoxConfig
            key={i}
            number={String(n+1)}
            onChange={this.onChangeBox.bind(this, n)}
            box={this.boxes[n]}
          />
        }
        return null;
      })}
      <br />
      Starting Cash: $<Num value={this.cash} onChange={this.onChangeCash.bind(this)} /><br />
      Table Minimum: $<Num value={this.minimum} onChange={this.onChangeMinimum.bind(this)} /><br />
      Deck Penetration: <Num value={this.penetration} onChange={this.onChangePenetration.bind(this)} /><br />
      <button className='bigButton' onClick={window.newGame}>New Game</button>
    </div>;
  }
}

class BoxConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ai: this.props.box.ai,
      difficulty: this.props.box.difficulty
    };
  }

  onChangeAI(i) {
    this.setState({
      ai: i === 'AI'
    });
  }

  onChangeDifficulty(i) {
    this.setState({
      difficulty: i
    });
  }

  componentDidUpdate() {
    this.props.onChange(this.state);
  }

  render() {
    return <div className='boxConfig'>
      Box {this.props.number}
      <Dropdown
        onSelect={this.onChangeAI.bind(this)}
        options={['No AI', 'AI']}
        selected={this.state.ai ? 'AI' : 'No AI'}
      />
      {
        this.state.ai ? <Dropdown
          onSelect={this.onChangeDifficulty.bind(this)}
          options={['Novice', 'Basic Strategy', 'Casual Counter', 'Advanced Counter', 'Perfect']}
          selected={this.state.difficulty}
        /> : null
      }
    </div>;
  }
}

export default GameSetup;
