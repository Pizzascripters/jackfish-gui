import React from 'react';
import './style.css';

class Home extends React.Component {
  render() {
    return <div id='home'>
      <div id='socials'>
        <a target='_blank' href='http://github.com/Pizzascripters/Jackfish' rel='noopener noreferrer'>
          <img id='github-link' src='img/GitHub-Mark-64px.png' alt='Github Link' />
        </a>
      </div>
      <div id='project-title'>
        Jackfish
        <img src='Jackfish/img/headwhite-256.png' alt='Jackfish logo' />
      </div>
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
