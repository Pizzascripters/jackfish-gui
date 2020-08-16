import React from 'react';
import './style.css';

const DEFAULT_DATA = [
  ['Lose 1:1', 0],
  ['Push', 0],
  ['Win 1:1', 0]
];

class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {data: []};
  }

  render() {
    let max;
    let data = this.props.data;
    if(data.length > 0) {
      max = data.reduce((acc, x) => acc > x[1] ? acc : x[1]);
    } else {
      max = 1;
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
          return <div key={i} className='column' style={style}></div>;
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
