import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Header from './components/Header';
import Home from './scenes/Home';
import Strategy from './scenes/Strategy';
import Simulation from './scenes/Simulation';
import Practice from './scenes/Practice';
import Install from './scenes/Install';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { page: 'home' };
    this.navFunctions = {
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
    switch(this.state.page) {
      case 'strategy':
        content = <Strategy />;
        break;
      case 'simulation':
        content = <Simulation />;
        break;
      case 'practice':
        content = <Practice />;
        break;
      case 'home':
        content = <Home navFunctions={this.navFunctions} />;
        break;
      case 'install':
        content = <Install />;
        break;
      default:
        content = null;
        break;
    }
    return <div id='container'>
      <Header page={this.state.page} onClick={this.onClick.bind(this)} />
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
