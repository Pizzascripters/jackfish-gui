import React from 'react';
import Num from '../../../../components/Number';
import Tabs from '../../../../components/Tabs';
import './style.css';

class SimRules extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rules: [],
      bet: 10,
      cash: Infinity,
      maxHands: Infinity,
      maxShoes: Infinity,
      maxCash: Infinity,
      yellow: 0
    };
  }

  addRule() {
    let rule = {
      value: 0,
      bet: 10
    };
    rule.onChange = this.onChangeRule.bind(this, rule);
    this.state.rules.splice(0, 0, rule);
    this.setState({
      rules: this.state.rules
    });
  }

  onChangeRule(rule, newValue, newBet) {
    rule.value = newValue;
    rule.bet = newBet;
    this.setState({});
  }

  destruct(key) {
    this.state.rules.forEach((rule, i) => {
      if(String(i) === String(key)) {
        this.state.rules.splice(i, 1);
      }
    });
    this.setState({
      rules: this.state.rules
    });
  }

  onChangeBet(bet) {
    this.setState({ bet });
  }

  onChangeCash(cash) {
    this.setState({ cash });
  }

  onChangeMaxHands(maxHands) {
    this.setState({ maxHands });
  }

  onChangeMaxShoes(maxShoes) {
    this.setState({ maxShoes });
  }

  onChangeMaxCash(maxCash) {
    this.setState({ maxCash });
  }

  onChangeYellow(yellow) {
    this.setState({ yellow });
  }

  componentDidMount() {
    this.props.onUpdate(this.state);
  }

  componentDidUpdate() {
    this.props.onUpdate(this.state);
  }

  render() {
    return <div id='simRules' className='section'>
      <Tabs names={['Betting', 'Ending']} renderTab={(tab) => {
        if(tab === 0) {
          return this.renderBetting();
        } else if(tab === 1) {
          return this.renderEnding();
        }
        return null;
      }}/>
    </div>;
  }

  renderBetting() {
    return <div>
      {this.state.rules.map((rule, i) => <Rule
        value={rule.value}
        bet={rule.bet}
        onChange={rule.onChange}
        destruct={this.destruct.bind(this, i)}
        key={i} />)
      }
      <div className='rule'>
        <span className='condition'>
          {this.state.rules.length > 0 ? 'Otherwise ' : 'Always '}
        </span>
        <span className='bet'>
          bet $<Num value={this.state.bet} onChange={this.onChangeBet.bind(this)} />
        </span>
      </div>
      <button id='addRule' onClick={this.addRule.bind(this)}>Add Rule</button>
    </div>;
  }

  renderEnding() {
    return <div className='ending'>
      Starting Cash: $<Num
        onChange={this.onChangeCash.bind(this)}
        value={this.state.cash}
        emptyValue={Infinity} /><br />
      <span className='tiny'>Empty for unlimited</span><br /><br />
      Max Hands: <Num
        onChange={this.onChangeMaxHands.bind(this)}
        value={this.state.maxHands}
        emptyValue={Infinity} /><br /><br />
      Max Shoes: <Num
        onChange={this.onChangeMaxShoes.bind(this)}
        value={this.state.maxShoes}
        emptyValue={Infinity} /><br /><br />
      Max Cash: $<Num
        onChange={this.onChangeMaxCash.bind(this)}
        value={this.state.maxCash}
        emptyValue={Infinity} /><br /><br />
      Yellow Card Location: <Num
        onChange={this.onChangeYellow.bind(this)}
        value={this.state.yellow}
        emptyValue={0} /><br />
      <span className='tiny'>In number of decks. Empty for no yellow card</span>
    </div>;
  }
}

class Rule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
      bet: this.props.bet
    };
  }

  onChangeValue(value) {
    this.setState({ value });
    this.props.onChange(value, this.state.bet);
  }

  onChangeBet(bet) {
    this.setState({ bet });
    this.props.onChange(this.state.value, bet);
  }

  render() {
    return <div className='rule'>
      <span className='delete' onClick={this.props.destruct}>X</span>
      <div className='condition'>
        If true count is greater than <Num value={this.state.value} onChange={this.onChangeValue.bind(this)} />
      </div>
      <div className='bet'>
        Bet $<Num value={this.state.bet} onChange={this.onChangeBet.bind(this)} />
      </div>
    </div>
  }
}

// class Dropdown extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {selected: props.selected, open: false};
//     this.self = React.createRef();
//   }
//
//   componentDidMount() {
//     window.addEventListener('click', onClick.bind(this));
//
//     function onClick(e) {
//       if(this.self.current === null) {
//         window.removeEventListener('click', onClick);
//       } else if(!this.self.current.contains(e.target)) {
//         this.setState({
//           open: false
//         });
//       }
//     }
//   }
//
//   dropdown(e) {
//     if(e.target.className === 'option') {
//       this.setState({
//         open: false,
//         selected: e.target.innerHTML
//       });
//       if(this.props.onSelect) {
//         this.props.onSelect(e.target.innerHTML);
//       }
//     } else {
//       this.setState({
//         open: !this.state.open
//       });
//     }
//   }
//
//   render() {
//     return <div ref={this.self} onClick={this.dropdown.bind(this)} className='dropdown'>
//       <div className='dropdownText'> {this.state.selected} <span className='tiny'>&#9660;</span></div>
//       <div className={'options' + (this.state.open ? '' : ' hidden')}>
//         {this.props.options.map((option, i) => {
//           return <div key={i} className='option'>{option}</div>;
//         })}
//       </div>
//     </div>;
//   }
// }

export default SimRules;
