import React from 'react';
import Num from '../../../../components/Number';
import './style.css';

class SimRules extends React.Component {
  constructor(props) {
    super(props);
    this.i = 0;
    this.state = {rules: [], bet: 10};
  }

  addRule() {
    let key = this.i++;
    this.state.rules.splice(0, 0,
      <Rule
        variable='True Count'
        value={0}
        bet={10}
        destruct={this.destruct.bind(this, key)}
        key={key} />
    );
    this.setState({
      rules: this.state.rules
    });
  }

  destruct(key) {
    this.state.rules.forEach((rule, i) => {
      if(String(rule.key) === String(key)) {
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

  render() {
    return <div id='simRules' className='section'>
      {this.state.rules.map((rule, i) => rule)}
      <div className='rule'>
        <div className='condition'>
          {this.state.rules.length > 0 ? 'Otherwise' : 'Always'}
        </div>
        <div className='bet'>
          Bet $<Num value={this.state.bet} onChange={this.onChangeBet.bind(this)} />
        </div>
      </div>
      <button id='addRule' onClick={this.addRule.bind(this)}>Add Rule</button>
    </div>
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
  }

  onChangeBet(bet) {
    this.setState({ bet });
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

class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selected: props.selected, open: false};
    this.self = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('click', onClick.bind(this));

    function onClick(e) {
      if(this.self.current === null) {
        window.removeEventListener('click', onClick);
      } else if(!this.self.current.contains(e.target)) {
        this.setState({
          open: false
        });
      }
    }
  }

  dropdown(e) {
    if(e.target.className === 'option') {
      this.setState({
        open: false,
        selected: e.target.innerHTML
      });
      if(this.props.onSelect) {
        this.props.onSelect(e.target.innerHTML);
      }
    } else {
      this.setState({
        open: !this.state.open
      });
    }
  }

  render() {
    return <div ref={this.self} onClick={this.dropdown.bind(this)} className='dropdown'>
      <div className='dropdownText'> {this.state.selected} <span className='tiny'>&#9660;</span></div>
      <div className={'options' + (this.state.open ? '' : ' hidden')}>
        {this.props.options.map((option, i) => {
          return <div key={i} className='option'>{option}</div>;
        })}
      </div>
    </div>;
  }
}

export default SimRules;
