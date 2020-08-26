import React from 'react';
import './style.css';

function Insurance(props) {
  let insurance;
  if(props.yes) {
    insurance = <div className='green'>Yes</div>
  } else {
    insurance = <div className='red'>No</div>
  }

  return <div id='insurance'>
    Take Insurance?
    {insurance}
  </div>;
}

export default Insurance;
