import React, { Component, PropTypes } from 'react'
// import memoize from 'fast-memoize'
import equal from 'shallowequal'

import { resolveFunctions, applyTransformations } from './resolve'

import flattenArray from './transformations/flattenArray'
import prefix from './transformations/prefix'

const defaultOptions = {
  withRef: false,
  transformations: [flattenArray, prefix],
}

export default (stylesCreator, options) => {

  options = options ? {
    ...defaultOptions,
    ...options,
    transformations: [
      ...defaultOptions.transformations,
      ...options.transformations,
    ],
  } : defaultOptions

  return WrappedComponent => class StylesEnhancer extends Component {

    constructor(props) {
      super()

      this.state = this.buildState(props)
    }

    componentWillReceiveProps(nextProps, nextContext) {
      if (!equal(nextProps, this.props)) {
        this.setState(this.buildState(nextProps, nextContext))
      }

      // Update all styles on HMR
      if (module.hot) {
        this.setState(this.buildState(nextProps, nextContext))
      }
    }

    buildState(props) {
      const getStyles = this.buildStyles.bind(this, props)

      return {styles: getStyles(), getStyles}
    }

    buildStyles(props, custom = null) {

      // TODO Handle getDefaultProps() for classic React?
      const defaultProps = WrappedComponent.defaultProps
      const mergedProps = {...defaultProps, ...props}

      const resolvedStyles = resolveFunctions(stylesCreator, mergedProps, custom)

      console.log('resolvedStyles', resolvedStyles)

      return applyTransformations(options.transformations, resolvedStyles, mergedProps, custom)
    }

    getWrappedInstance() {
      return this.refs.wrappedInstance
    }

    render() {
      const {styles, getStyles} = this.state

      const element = (
        <WrappedComponent
          styles={styles}
          getStyles={getStyles}
          {...this.props}
        />
      )

      if (options.withRef) {
        return React.cloneElement(element, {ref: 'wrappedInstance'})
      }

      return element
    }
  }
}
