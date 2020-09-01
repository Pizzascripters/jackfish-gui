import React from 'react';
import './style.css';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      windowSize: 'large'
    }
    if(window.innerWidth < 600) {
      this.state.windowSize = 'small';
    }
    this.onResize = e => {
      if(window.innerWidth < 600 && this.state.windowSize !== 'small') {
        this.setState({
          windowSize: 'small'
        });
      } else if(window.innerWidth > 600 && this.state.windowSize !== 'large') {
        this.setState({
          windowSize: 'large'
        });
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }

  render() {
    if(this.state.windowSize === 'small') {
      return <HamburgerMenu page={this.props.page} onClick={this.props.onClick} />
    }
    return <header>
      <Link
        name='Home'
        text=<span>Jackfish <img src='Jackfish/img/headwhite-256.png' alt='Jackfish logo' /></span>
        homelink={true}
        page={this.props.page}
        onClick={this.props.onClick}
      />
      <Link name='Practice' page={this.props.page} onClick={this.props.onClick} />
      <Link name='Strategy' page={this.props.page} onClick={this.props.onClick} />
      <Link name='Simulation' page={this.props.page} onClick={this.props.onClick} />
      <div className='right'>
        <Link name='Install' page={this.props.page} onClick={this.props.onClick} />
      </div>
    </header>;
  }
}

class HamburgerMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropped: false
    };

    this.clickListener = e => {
      if(e.target.className !== 'icon' && e.target.className !== 'fa fa-bars') {
        this.setDropped(false);
      }
    }
  }

  componentDidMount() {
    window.addEventListener('click', this.clickListener);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.clickListener);
  }

  toggle() {
    this.setState({
      dropped: !this.state.dropped
    });
  }

  setDropped(dropped) {
    this.setState({ dropped });
  }

  render() {
    let className = '';
    if(this.state.dropped) {
      className = 'dropped';
    }
    return <header className={className}>
      <Link
        name='Home'
        text=<span>Jackfish <img src='Jackfish/img/headwhite-256.png' alt='Jackfish logo' /></span>
        homelink={true}
        page={this.props.page}
        onClick={this.props.onClick}
      />
      <button className='icon' onClick={this.toggle.bind(this)}>
        <i className='fa fa-bars'></i>
      </button>
      <div className='links'>
        <Link name='Practice' page={this.props.page} onClick={this.props.onClick} />
        <Link name='Strategy' page={this.props.page} onClick={this.props.onClick} />
        <Link name='Simulation' page={this.props.page} onClick={this.props.onClick} />
        <Link name='Install' page={this.props.page} onClick={this.props.onClick} />
      </div>
    </header>;
  }
}

function Link(props) {
  let className = 'navlink';
  if(props.homelink) {
    className = 'homelink';
  }
  if(props.name.toLocaleLowerCase() === props.page) {
    className += ' selected';
  }
  let text = props.text;
  if(props.text === undefined) {
    text = props.name;
  }
  return <div className={className} onClick={props.onClick.bind(null, props.name.toLocaleLowerCase())}>
    <div>{text}</div>
  </div>
}

export default Header;
