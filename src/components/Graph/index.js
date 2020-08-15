import React from 'react';
import './style.css';

class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {data: this.props.data};
  }

  render() {
    let max = this.state.data.reduce((acc, x) => acc > x[1] ? acc : x[1]);
    return <div className='graphContainer'>
      <div className='graph'>
        {this.state.data.map((column, i) => {
          let style = {
            height: 270 * column[1] / max
          }
          return <div key={i} className='column' style={style}></div>;
        })}
      </div>
      <div className='labels'>
        {this.state.data.map((column, i) => {
          return <span key={i}>{column[0]}</span>;
        })}
      </div>
    </div>;
  }
}

export default Graph;
