import React from 'react';
import './style.css';

class Switch extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {enabled: props.enabled}
  }

  handleClick() {
    this.setState({
      enabled: !this.state.enabled
    });
    this.props.onChange(!this.state.enabled); // React hasn't set the state yet
  }

  render() {
    let active = this.state.enabled ? ' active' : '';
    return <div className='switch' onMouseDown={this.handleClick}>
      {this.props.label}<br />
      <div className={'switchBg' + active}></div>
      <div className={'switchSlider' + active}></div>
    </div>;
  }
}

export default Switch;
