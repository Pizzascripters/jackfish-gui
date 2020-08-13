import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Strategy from './scenes/Strategy';
import Simulation from './scenes/Simulation';

ReactDOM.render(
  <React.StrictMode>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap" rel="stylesheet" />
    <Simulation />
  </React.StrictMode>,
  document.getElementById('root-container')
);
