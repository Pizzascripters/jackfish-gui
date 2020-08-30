import React from 'react';
import './style.css';

class Home extends React.Component {
  render() {
    return <div id='home'>
      <div id='project-title'>Jackfish</div>
      <div id='project-description'>Open Source Blackjack Engine</div>
      <div className='homelinks'>
        <div className='blocklink' onClick={this.props.navFunctions.practice}>Practice</div>
        <div className='blocklink' onClick={this.props.navFunctions.strategy}>Strategy</div>
        <div className='blocklink' onClick={this.props.navFunctions.simulation}>Simulation</div>
      </div>
    </div>;
  }
}

export default Home
