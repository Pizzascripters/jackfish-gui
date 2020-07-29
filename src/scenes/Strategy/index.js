import React from 'react';
import Parameters from './components/Parameters';
import Table from './components/Table';
import Analysis from './components/Analysis';
import './style.css';

function Strategy() {
  return <div id='strategy'>
    <Parameters />
    <Table />
    <Analysis />
  </div>
}

export default Strategy;
