import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Strategy from './scenes/Strategy';
import Simulation from './scenes/Simulation';

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
    }
    return <div id='container'>
      <header>
        <a onClick={this.onClick.bind(this, 'strategy')}>Strategy</a>
        <a onClick={this.onClick.bind(this, 'simulation')}>Simulation</a>
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
