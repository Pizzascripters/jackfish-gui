import React from 'react';
import {formatPercent} from '../../lib/lib.js';
import './style.css';

const DEFAULT_DATA = [];

class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {data: []};
  }

  componentDidMount() {
    window.addEventListener('click', this.clickListener.bind(this));
  }

  clickListener(e) {
    if(this.ref.current === null) {
      return;
    }
    let stateCopy = this.state;
    Object.keys(this.state).forEach((key) => {
      if(key === 'data') return;
      if(stateCopy[key] === true) {
        stateCopy[key] = 1;
      } else {
        stateCopy[key] = false;
      }
    });
    this.setState(stateCopy);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.clickListener)
  }

  onClick(key) {
    this.onMouseEnter(key);
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
    return <div className='graphContainer' ref={this.ref}>
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
            onClick={this.onClick.bind(this, i)}
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
