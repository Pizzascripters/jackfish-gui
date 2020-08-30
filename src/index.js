import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Home from './scenes/Home';
import Strategy from './scenes/Strategy';
import Simulation from './scenes/Simulation';
import Practice from './scenes/Practice';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { page: 'home' };
    this.navFunctions = {
      'home': this.onClick.bind(this, 'home'),
      'practice': this.onClick.bind(this, 'practice'),
      'strategy': this.onClick.bind(this, 'strategy'),
      'simulation': this.onClick.bind(this, 'simulation'),
    }
  }

  onClick(page) {
    this.setState({ page });
  }

  render() {
    let content;
    let homeSelected = '',
        practiceSelected = '',
        strategySelected = '',
        simulationSelected = '';
    switch(this.state.page) {
      case 'strategy':
        content = <Strategy />;
        strategySelected = ' selected';
        break;
      case 'simulation':
        content = <Simulation />;
        simulationSelected = ' selected';
        break;
      case 'practice':
        content = <Practice />;
        practiceSelected = ' selected';
        break;
      case 'home':
        content = <Home navFunctions={this.navFunctions} />;
        homeSelected = ' selected';
        break;
      default:
        content = null;
        break;
    }
    return <div id='container'>
      <header>
        <div className={'homelink' + homeSelected} onClick={this.navFunctions.home}>
          <div>Jackfish Engine</div>
        </div>
        <div className={'navlink' + practiceSelected} onClick={this.navFunctions.practice}>
          <div>Practice</div>
        </div>
        <div className={'navlink' + strategySelected} onClick={this.navFunctions.strategy}>
          <div>Strategy</div>
        </div>
        <div className={'navlink' + simulationSelected} onClick={this.navFunctions.simulation}>
          <div>Simulation</div>
        </div>
      </header>
      {content}
    </div>;
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root-container')
);
