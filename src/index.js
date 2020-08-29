import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Strategy from './scenes/Strategy';
import Simulation from './scenes/Simulation';
import Practice from './scenes/Practice';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { page: 'strategy' };
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
      default:
        content = null;
        break;
    }
    return <div id='container'>
      <header>
        <p className='link' onClick={this.onClick.bind(this, 'practice')}>Practice</p>
        <p className='link' onClick={this.onClick.bind(this, 'strategy')}>Strategy</p>
        <p className='link' onClick={this.onClick.bind(this, 'simulation')}>Simulation</p>
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
