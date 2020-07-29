import React from 'react';
import stateToName from '../../../../lib/lib.js';
import './style.css';

function Analysis(props) {
  return <div id='analysis' className='section'>
    <Header selection={props.selection}/>
  </div>;
}

function Header(props) {
  if(props.selection) {
    return <div id='header'>
      {stateToName(props.selection[0], true)} vs Dealer {stateToName(props.selection[1], true)}
    </div>
  } else {
    return null;
  }
}

export default Analysis;
