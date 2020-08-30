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
      default:
        content = null;
        break;
    }
    return <div id='container'>
      <header>
        <Link
          name='Home'
          text={'Jackfish Engine'}
          homelink={true}
          page={this.state.page}
          onClick={this.onClick.bind(this)}
        />
        <Link name='Practice' page={this.state.page} onClick={this.onClick.bind(this)} />
        <Link name='Strategy' page={this.state.page} onClick={this.onClick.bind(this)} />
        <Link name='Simulation' page={this.state.page} onClick={this.onClick.bind(this)} />
      </header>
      {content}
    </div>;
  }
}

function Link(props) {
  let className = 'navlink';
  if(props.homelink) {
    className = 'homelink';
  }
  let selected = '';
  if(props.name.toLocaleLowerCase() === props.page) {
    selected = ' selected';
  }
  let text = props.text;
  if(props.text === undefined) {
    text = props.name;
  }
  return <div className={className + selected} onClick={props.onClick.bind(null, props.name.toLocaleLowerCase())}>
    <div>{text}</div>
  </div>
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root-container')
);
