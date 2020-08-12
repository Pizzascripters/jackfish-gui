import React from 'react';
import Num from '../../../../components/Number';
import Select from '../../../../components/Select';
import Switch from '../../../../components/Switch';
import Tabs from '../../../../components/Tabs';
import Count from '../../../../lib/Count.js';
import './style.css';

let params = [
  [
    new Param('Select', 'Soft 17', 'Hits', 'Stands'),
    new Param('Select', 'Blackjack', '3:2', '6:5'),
    new Param('Select', 'Surrender', 'None', 'Early', 'Late'),
    new Param('Select', 'Max Hands', 'Unlimited', 'Four', 'Two'),
    new Param('Select', 'Resplit', 'Allowed', 'No Aces', 'Never'),
    new Param('Select', 'Doubling', '2 Cards', 'Anytime'),
    new Param('Select', 'Min Double', 'None', '8', '9', '10', '11'),
    new Param('Switch', 'Peek Aces and Tens', true),
    new Param('Switch', 'One Card After Ace Split', true),
    new Param('Switch', 'Double After Split', true),
  ],
  [
    new Param('Select', 'System', 'None', 'HiLo', 'KO', 'Omega II', 'Wong Halves', 'Uston APC'),
    new Param('Number', 'True Count', 0, 40, false),
    new Param('Number', 'Count', 0, 120, false),
    new Param('Number', 'Decks', 6, 20, true),
  ]
];
// Two max hands and no resplitting are equivalent
getParam('Max Hands').on('Two', () => {
  getParam('Resplit').set('Never', true);
});
getParam('Resplit').on('Never', () => {
  getParam('Max Hands').set('Two', true);
});
// >2 max hands with no resplitting is a contradiction
getParam('Max Hands').on('Four', () => {
  if(getParam('Resplit').value === 'Never') {
    getParam('Resplit').set('Allowed', true);
  }
});
getParam('Max Hands').on('Unlimited', () => {
  if(getParam('Resplit').value === 'Never') {
    getParam('Resplit').set('Allowed', true);
  }
});
// 2 max hands with resplitting is a contradiction
getParam('Resplit').on('No Aces', () => {
  if(getParam('Max Hands').value === 'Two') {
    getParam('Max Hands').set('Unlimited', true);
  }
});
getParam('Resplit').on('Allowed', () => {
  if(getParam('Max Hands').value === 'Two') {
    getParam('Max Hands').set('Unlimited', true);
  }
});
// No peek with late surrender is a contradiction
getParam('Peek Aces and Tens').on(false, () => {
  if(getParam('Surrender').value === 'Late') {
    getParam('Surrender').set('Early', true);
  }
});
getParam('Surrender').on('Late', () => {
  if(getParam('Peek Aces and Tens').value === false) {
    getParam('Peek Aces and Tens').set(true, true);
  }
});
getParam('System').on('None', () => {
  getParam('True Count').setVisibility(false);
  getParam('Count').setVisibility(false);
});
getParam('System').on('HiLo', () => {
  getParam('True Count').setVisibility(true);
  getParam('Count').setVisibility(false);
});
getParam('System').on('KO', () => {
  getParam('True Count').setVisibility(false);
  getParam('Count').setVisibility(true);
});
getParam('System').on('Omega II', () => {
  getParam('True Count').setVisibility(true);
  getParam('Count').setVisibility(false);
});
getParam('System').on('Wong Halves', () => {
  getParam('True Count').setVisibility(true);
  getParam('Count').setVisibility(false);
});
getParam('System').on('Uston APC', () => {
  getParam('True Count').setVisibility(true);
  getParam('Count').setVisibility(false);
});


function Param(type, label, ...options) {
  let visible = true;
  let elem;
  let listeners = [];

  this.type = type;
  this.label = label;
  this.options = options;

  if(type === 'Switch') {
    this.options = [options[0], !options[0]];
  } else if(type === 'Number' && options[2] === false) {
    visible = false;
  }

  this.value = this.options[0];

  this.onChange = (updateEngine, i, skipListeners) => {
    if(type === 'Select') {
      this.value = this.options[i];
    } else if(type === 'Switch' || type === 'Number') {
      this.value = i;
    }
    if(skipListeners !== true) {
      for(let l of listeners) {
        if(
          (type === 'Select' && l[0] === this.options[i]) ||
          (type === 'Switch' && l[0] === i)
        ) {
          l[1]();
        }
      }
    }

    if(updateEngine) {
      update(updateEngine);
    }
  }

  this.on = (value, f) => {
    listeners.push([value, f]);
  }

  this.set = (value, skipListeners) => {
    this.value = value;
    if(type === 'Select') {
      changeFunction(this.options.indexOf(value), skipListeners);
    } else if(type === 'Switch') {
      changeFunction(value, skipListeners);
    }
  }

  this.setVisibility = (v) => {
    visible = v;
  }

  this.render = (key, updateEngine) => {
    if(visible === false) {
      return null;
    }
    if(type === 'Select') {
      elem = <Select
        key={key}
        label={this.label}
        options={this.options}
        onChange={this.onChange.bind(null, updateEngine)}
        setChangeFunction={setChangeFunction}
        value={this.options.indexOf(this.value)}
      />;
    } else if(type === 'Switch') {
      elem = <Switch
        key={key}
        label={this.label}
        enabled={this.value}
        onChange={this.onChange.bind(null, updateEngine)}
        setChangeFunction={setChangeFunction}
      />;
    } else if(type === 'Number') {
      let max;
      if(this.options[1]) {
        max = this.options[1];
      }
      elem = <Num
        key={key}
        label={this.label}
        onChange={this.onChange.bind(null, updateEngine)}
        setChangeFunction={setChangeFunction}
        value={this.value}
        max={max}
      />;
    } else {
      elem = null;
    }
    return elem;
  }

  let changeFunction;
  function setChangeFunction(f) {
    changeFunction = f;
  }
}

function getParam(label) {
  for(let i = 0; i < params.length; i++) {
    for(let j = 0; j < params[i].length; j++) {
      if(params[i][j].label === label) {
        return params[i][j];
      }
    }
  }
  return null;
}

function update(f) {
  let maxHands = getParam('Max Hands').value;
  if(maxHands === 'Unlimited') {
    maxHands = Infinity;
  } else if(maxHands === 'Four') {
    maxHands = 4;
  } else if(maxHands === 'Two') {
    maxHands = 2;
  }
  let minDouble = getParam('Min Double').value;
  if(minDouble === 'None') {
    minDouble = 0;
  } else {
    minDouble = Number(minDouble);
  }
  let decks = Number(getParam('Decks').value);
  if(isNaN(decks) || decks <= 0) decks = 1;
  let count;
  if(getParam('System').value === 'None') {
    count = new Count('none', 0, decks);
  } else if(getParam('System').value === 'HiLo') {
    count = new Count('hilo', getParam('True Count').value, decks);
  } else if(getParam('System').value === 'KO') {
    count = new Count('ko', Number(getParam('Count').value / decks), decks);
  } else if(getParam('System').value === 'Omega II') {
    count = new Count('omega2', getParam('True Count').value, decks);
  } else if(getParam('System').value === 'Wong Halves') {
    count = new Count('wonghalves', getParam('True Count').value, decks);
  } else if(getParam('System').value === 'Uston APC') {
    count = new Count('ustonapc', getParam('True Count').value, decks);
  }
  f({
    blackjack: getParam('Blackjack').value === '3:2' ? 3/2 : 6/5,
    count,
    peek: getParam('Peek Aces and Tens').value,
    soft17: getParam('Soft 17').value === 'Hits',
    surrender: getParam('Surrender').value.toLocaleLowerCase(),
    double: {
      anytime: getParam('Doubling').value === 'Anytime',
      min: minDouble
    },
    split: {
      double: getParam('Double After Split').value,
      maxHands: maxHands,
      oneCardAfterAce: getParam('One Card After Ace Split').value,
      resplit: getParam('Resplit').value !== 'Never',
      resplitAces: getParam('Resplit').value !== 'No Aces',
    },
  });
}

class Parameters extends React.Component {
  constructor(props) {
    super(props);
    update(props.updateEngine);
    props.onLoad();
  }

  render() {
    return <div id='parameters' className='section'>
      <Tabs names={['Rules', 'Count']} renderTab={(tab) => {
        return params[tab].map((param, i) => {
          return param.render(i, this.props.updateEngine);
        })
      }}/>
    </div>;
  }
}

export default Parameters;
