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
      maxHands: 100,
      maxShoes: Infinity,
      maxCash: Infinity,
      yellow: 1
    };
    this.rules = [];
  }

  addRule() {
    let rule = {
      value: 0,
      bet: 10
    };
    rule.onChange = this.onChangeRule.bind(this, rule);
    this.rules.splice(0, 0, rule);
    let copyRules = [];
    for(let i = 0; i < this.rules.length; i++) {
      copyRules.push({
        value: this.rules[i].value,
        bet: this.rules[i].bet
      });
    }
    this.setState({
      rules: copyRules
    });
  }

  onChangeRule(rule, newValue, newBet) {
    rule.value = newValue;
    rule.bet = newBet;
    let copyRules = [];
    for(let i = 0; i < this.rules.length; i++) {
      copyRules.push({
        value: this.rules[i].value,
        bet: this.rules[i].bet
      });
    }
    this.setState({
      rules: copyRules
    });
  }

  destruct(key) {
    this.rules.forEach((rule, i) => {
      if(String(i) === String(key)) {
        this.rules.splice(i, 1);
      }
    });
    this.setState({});
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
      {this.rules.map((rule, i) => <Rule
        value={rule.value}
        bet={rule.bet}
        onChange={rule.onChange}
        destruct={this.destruct.bind(this, i)}
        key={i} />)
      }
      <div className='rule'>
        <span className='condition'>
          {this.rules.length > 0 ? 'Otherwise ' : 'Always '}
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
      Cut Card Location: <Num
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

export default SimRules;
