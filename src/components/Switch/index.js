import React from 'react';
import './style.css';

class Switch extends React.Component {
  constructor(props) {
    super(props);
    if(this.props.setChangeFunction) {
      this.props.setChangeFunction(this.setEnabled.bind(this));
    }
    this.handleClick = this.handleClick.bind(this);
    this.state = {enabled: props.enabled};
  }

  handleClick() {
    this.setState({
      enabled: !this.state.enabled
    });
    if(this.props.onChange) {
      this.props.onChange(!this.state.enabled); // React hasn't set the state yet
    }
  }

  setEnabled(enabled) {
    this.setState({ enabled });
    this.props.onChange(enabled);
  }

  render() {
    let active = this.state.enabled ? ' active' : '';
    let large = this.props.large ? ' largeSwitch' : '';
    let label = this.props.label ? <span>{this.props.label}<br /></span> : null;
    return <div className={'switch' + large} onMouseDown={this.handleClick}>
      {label}
      <div className={'switchBg' + active}></div>
      <div className={'switchSlider' + active}></div>
    </div>;
  }
}

export default Switch;
