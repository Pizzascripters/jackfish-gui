import React from 'react';
import Select from '../../../../components/Select'
import './style.css';

let params = [
  new Param('Soft 17', 'Hits', 'Stands'),
  new Param('Blackjack', '3:2', '6:5'),
  new Param('Surrender', 'None', 'Early', 'Late'),
];

function Param(label, ...options) {
  this.label = label;
  this.options = options;
  this.value = options[0].toLocaleLowerCase();

  this.onChange = (i) => {
    this.value = options[i].toLocaleLowerCase();

    window.render.bind(window.jackfish = new window.Jackfish({
      count: new window.Count('none', 0, 1),
      soft17: getParam('Soft 17').value === 'hits',
      surrender: getParam('Surrender').value
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
      return <Select key={i} label={param.label} options={param.options} onChange={param.onChange}/>
    })}
  </div>;
}

export default Parameters;
