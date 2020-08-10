import React from 'react';
import './style.css';

class Num extends React.Component {
  constructor(props) {
    super(props);
    this.props.setChangeFunction(this.onChange.bind(this));
    this.state = {value: props.value, valid: true};
  }

  onChange(e) {
    let value = Number(e.target.value);
    if(!isNaN(value) && (!this.props.max || Math.abs(value) <= this.props.max)) {
      if(this.state.value !== value) {
        this.setState({ value, valid: true });
        this.props.onChange(value, false);
      } else {
        this.setState({ valid: true });
      }
    } else {
      this.setState({ valid: false });
    }
  }

  render() {
    return <div className='number'>
      {this.props.label}<br />
      <input
        className={this.state.valid ? 'valid' : 'invalid'}
        type='text'
        onChange={this.onChange.bind(this)}
        defaultValue={this.props.value} />
    </div>;
  }
}

export default Num;
