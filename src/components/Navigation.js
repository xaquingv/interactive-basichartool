import React from 'react';
import {connect} from 'react-redux';
import './navigation.css';
import {changeStep} from '../actions';
import scrollTo from '../lib/scrollTo';
import logo from '../assets/logo.svg';


const mapDispatchToProps = (dispatch) => ({
  onClickStep: (step) => {
    dispatch(changeStep(step));
  }
});

const mapStateToProps = (state) => ({
  step: state.step,
  stepActive: state.stepActive
});

class Navigation extends React.Component {
  static propTypes = {
    step: React.PropTypes.number.isRequired,
  };

  animateScroll = () => {
    const to = document.querySelector("#section" + this.props.step).offsetTop - 80;
    scrollTo(to, null, 1000);
  };
  
  // dom ready
  componentDidUpdate() {
    this.animateScroll();
  };

  render() {
    //console.log("props:", this.props);
    const {step, stepActive, list, onClickStep} = this.props;
    return (
      <nav className="nav">
        <ul className="ul-flex l-section">
          <li>Step</li>
          {list.map((li, index) => <li
            key={"step"+(index+1)}
            ref={(node) => this.node = node}
            className={"li step" + ((step===index+1)?" li-focus":"") + ((stepActive>=index+1)?"":" pe-n")}
            onClick={()=>onClickStep(index+1)}>{li}
          </li>)}
          <li><img src={logo} className="logo" alt="logo" /></li>
        </ul>
      </nav>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
