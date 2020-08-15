import React from 'react';
import './style.css';

class Num extends React.Component {
  constructor(props) {
    super(props);
    if(this.props.setChangeFunction) {
      this.props.setChangeFunction(this.onChange.bind(this));
    }
    this.state = {value: props.value, valid: true};
  }

  onChange(e) {
    let value = Number(e.target.value);
    if(this.props.emptyValue !== undefined && e.target.value.length === 0) {
      this.setState({ value: this.props.emptyValue, valid: true });
      this.props.onChange(this.props.emptyValue, false);
    } else if(!isNaN(value) && (!this.props.max || Math.abs(value) <= this.props.max)) {
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
    let label = null;
    if(this.props.label) {
      label = <span>{this.props.label}<br /></span>;
    }
    let value = this.props.value;
    if(value === this.props.emptyValue) {
      value = '';
    }
    return <div className='number'>
      {label}
      <input
        className={this.state.valid ? 'valid' : 'invalid'}
        type='text'
        onChange={this.onChange.bind(this)}
        defaultValue={value} />
    </div>;
  }
}

export default Num;
