import React from 'react';
import Insurance from '../../../../components/Insurance';
import {formatPercent, formatMove} from '../../../../lib/lib.js';
import './style.css';

let analysis = null;
let system = 'None',
    count = null,
    trueCount = null,
    edge = 0,
    bestMove = null,
    insurance = false;

let perfectEdge = null,
    perfectBestMove = null,
    perfectInsurance = null;

window.updateCount = (system_, count_, trueCount_, edge_, bestMove_, insurance_) => {
  system = system_;
  count = count_;
  trueCount = trueCount_;
  edge = edge_;
  bestMove = bestMove_;
  insurance = insurance_;

  // Make first character capital
  if(/^[a-z]*$/.test(system[0])) {
    system = system[0].toLocaleUpperCase() + system.substring(1);
  }
  switch(system) {
    case 'Hilo':
      system = 'HiLo';
      break;
    case 'Ko':
      system = 'KO';
      break;
    case 'Omega2':
      system = 'Omega II';
      break;
    case 'Wonghalves':
      system = 'Wong Halves';
      break;
    case 'Ustonapc':
      system = 'Uston APC';
      break;
    default:
  }

  if(analysis) {
    analysis.updateCount();
  }
}

window.updatePerfect = (edge, bestMove, insurance) => {
  perfectEdge = edge;
  perfectBestMove = bestMove;
  perfectInsurance = insurance;
}

class Analysis extends React.Component {
  constructor(props) {
    super(props);
    analysis = {
      updateCount: this.updateCount.bind(this)
    }
  }

  updateCount() {
    this.setState({});
  }

  componentWillUnmount() {
    analysis = null;
  }

  render() {
    return <div id='practiceAnalysis'>
      <Count />
      <Perfect />
    </div>;
  }
}

function Count(props) {
  let systemText = `System: ${system}`;
  let countText = <span className='count'>{`Count: ${count}`}</span>;
  let tcText = <span className='trueCount'>{`True Count: ${trueCount}`}</span>;
  let edgeText = <span className='edge'>Edge: Calculating...</span>
  if(edge) {
    edgeText = <span className='edge'>Edge: {formatPercent(edge, true)}</span>;
  }

  let bestMoveText = <span className='bestMove'>Best Move: N/A</span>;
  if(bestMove) {
    bestMoveText = <span className='bestMove'>Best Move: {formatMove(bestMove)}</span>;
  }

  if(system === 'None') {
    return <div className='count'>
      <span className='system'>Card counting disabled</span>
    </div>;
  } else {
    return <div id='count'>
      <div>{systemText}</div>
      {countText} <br />
      {tcText} <br />
      {edgeText} <br />
      {bestMoveText}
      <Insurance yes={insurance} />
    </div>;
  }
}

function Perfect(props) {
  let edgeText = <span className='edge'>Edge: Calculating...</span>;
  if(perfectEdge) {
    edgeText = <span className='edge'>Edge: {formatPercent(perfectEdge, true)}</span>;
  }

  let bestMoveText = <span className='bestMove'>Best Move: N/A</span>;
  if(perfectBestMove) {
    bestMoveText = <span className='bestMove'>Best Move: {formatMove(perfectBestMove)}</span>;
  }
  return <div id='perfect'>
    <div>Perfect System</div>
    {edgeText} <br />
    {bestMoveText}
    <Insurance yes={perfectInsurance} />
  </div>;
}

export default Analysis;
