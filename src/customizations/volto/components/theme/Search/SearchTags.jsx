/**
 * Search tags components.
 * @module components/theme/Search/SearchTags
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { getVocabulary } from '@plone/volto/actions';

const vocabulary = 'plone.app.vocabularies.Keywords';

/**
 * Search tags container class.
 * @class SearchTags
 * @extends Component
 */
class SearchTags extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    getVocabulary: PropTypes.func.isRequired,
    terms: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
      }),
    ).isRequired,
  };

  componentDidMount() {
    this.props.getVocabulary({ vocabNameOrURL: vocabulary });
  }

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    const currentLang = this.props.currentLang;
    return this.props.terms && this.props.terms.length > 0 ? (
      <div id="search-tags">
        {this.props.terms.map((term) => (
          <Link
            className="ui label"
            to={`/${currentLang}/search?Subject=${encodeURIComponent(
              term.value,
            )}`}
            key={term.value}
          >
            {term.label}
          </Link>
        ))}
      </div>
    ) : (
      <span />
    );
  }
}

export default connect(
  (state) => ({
    currentLang: state.intl.locale,
    terms:
      state.vocabularies[vocabulary] && state.vocabularies[vocabulary].items
        ? state.vocabularies[vocabulary].items
        : [],
  }),
  { getVocabulary },
)(SearchTags);
