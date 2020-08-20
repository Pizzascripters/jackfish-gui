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

  onChange() {
    this.props.onChange({
      boxes: this.boxes,
      cash: this.cash,
      minimum: this.minimum
    })
  }

  render() {
    return <div id='gameSetup'>
      <BoxConfig number='1' onChange={this.onChangeBox.bind(this, 0)} box={this.boxes[0]}/>
      <BoxConfig number='2' onChange={this.onChangeBox.bind(this, 1)} box={this.boxes[1]}/>
      <BoxConfig number='3' onChange={this.onChangeBox.bind(this, 2)} box={this.boxes[2]}/>
      <BoxConfig number='4' onChange={this.onChangeBox.bind(this, 3)} box={this.boxes[3]}/>
      <BoxConfig number='5' onChange={this.onChangeBox.bind(this, 4)} box={this.boxes[4]}/><br />
      Starting Cash: $<Num value={this.cash} onChange={this.onChangeCash.bind(this)} /><br />
      Table Minimum: $<Num value={this.minimum} onChange={this.onChangeMinimum.bind(this)} /><br />
      <button class='bigButton'>New Game</button>
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
