import React, { Component, PropTypes } from 'react'

export default class extends Component {

  static childContextTypes = {
    theme: PropTypes.object,
  }

  getChildContext() {
    return {theme: this.props.theme}
  }

  shouldComponentUpdate(nextProps) {
    return this.props.theme !== nextProps.theme
  }

  render() {
    return this.props.children
  }
}