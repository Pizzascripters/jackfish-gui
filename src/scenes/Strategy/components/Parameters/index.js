import React from 'react';
import Select from '../../../../components/Select'
import Switch from '../../../../components/Switch'
import './style.css';

let params = [
  new Param('Select', 'Soft 17', 'Hits', 'Stands'),
  new Param('Select', 'Blackjack', '3:2', '6:5'),
  new Param('Select', 'Surrender', 'None', 'Early', 'Late'),
  new Param('Switch', 'Double After Split', true)
];

function Param(type, label, ...options) {
  this.type = type;
  this.label = label;
  this.options = options;

  if(type === 'Switch') {
    this.options = [options[0], !options[0]];
  }

  this.value = this.options[0];

  this.onChange = (i) => {
    if(type === 'Select') {
      this.value = this.options[i];
    } else if(type === 'Switch') {
      this.value = i;
    }

    window.render.bind(window.jackfish = new window.Jackfish({
      count: new window.Count('none', 0, 1),
      soft17: getParam('Soft 17').value === 'Hits',
      surrender: getParam('Surrender').value.toLocaleLowerCase(),
      doubleAfterSplit: getParam('Double After Split').value
    }))();
  }
}

function getParam(label) {
  for(let i = 0; i < params.length; i++) {
    if(params[i].label === label) {
      return params[i];
    }
  }
  return null;
}

function Parameters() {
  // TODO: Double after split switch
  // TODO: Deck text input
  return <div id='parameters' className='section'>
    {params.map((param, i) => {
      if(param.type === 'Select') {
        return <Select key={i} label={param.label} options={param.options} onChange={param.onChange}/>
      } else if(param.type === 'Switch') {
        return <Switch key={i} label={param.label} enabled={param.value} onChange={param.onChange}/>
      }
    })}
  </div>;
}

export default Parameters;
