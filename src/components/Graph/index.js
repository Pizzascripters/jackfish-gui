import React from 'react';
import {formatPercent} from '../../lib/lib.js';
import './style.css';

const DEFAULT_DATA = [];

class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {data: []};
  }

  onMouseEnter(key) {
    let state = {};
    state[key] = true;
    this.setState(state);
  }

  onMouseLeave(key) {
    let state = {};
    state[key] = false;
    this.setState(state);
  }

  render() {
    let max, total;
    let data = this.props.data;
    if(data.length > 0) {
      max = data.reduce((acc, x) => acc[1] > x[1] ? acc : x)[1];
      total = data.reduce((acc, x) => [0, acc[1] + x[1]])[1];
    } else {
      max = 1;
      total = 0;
      data = DEFAULT_DATA;
    }
    return <div className='graphContainer'>
      <div className='graph'>
        {data.map((column, i) => {
          let style = {
            height: 270 * column[1] / max
          }
          if(column[2]) {
            style.backgroundColor = column[2];
          }
          return <div
            key={i}
            onMouseEnter={this.onMouseEnter.bind(this, i)}
            onMouseLeave={this.onMouseLeave.bind(this, i)}
            className='columnContainer'>
            <div
              className='column'
              style={style}
            >{this.state[i] ? <div className='columnInfoContainer'>
              <div className='columnInfo'>
                <span>{column[1] + ' ' + (this.props.suffix ? this.props.suffix : 'cases')}</span><br />
                <span>{formatPercent(column[1] / total)}</span>
              </div>
            </div> : null}
          </div></div>;
        })}
      </div>
      <div className='labels'>
        {this.props.data.map((column, i) => {
          return <span key={i}>{column[0]}</span>;
        })}
      </div>
    </div>;
  }
}

export default Graph;
