import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { flattenToAppURL } from '@plone/volto/helpers';

/**
 *
 *
 * @class ScrollToTop
 * @extends {Component}
 */
class ScrollToTop extends React.Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }),
    children: PropTypes.node.isRequired,
  };

  /**
   * @param {*} prevProps Previous Props
   * @returns {null} Null
   * @memberof ScrollToTop
   */
  componentDidUpdate(prevProps) {
    if (this.props.location?.pathname === this.props.contentId) {
      window.scrollTo(0, 0);
    }
  }

  /**
   * @returns {node} Children
   * @memberof ScrollToTop
   */
  render() {
    return this.props.children;
  }
}

export default compose(
  withRouter,
  connect((state, props) => ({
    contentId: flattenToAppURL(state.content?.data?.['@id']),
  })),
)(ScrollToTop);
