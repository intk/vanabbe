/**
 * View image block.
 * @module components/manage/Blocks/Hero/View
 */

import React from 'react';
import PropTypes from 'prop-types';
import { flattenToAppURL } from '@plone/volto/helpers';
import { LinkMore } from '@plone/volto/components';

/**
 * View image block class.
 * @class View
 * @extends Component
 */
const View = ({ data }) => (
  <div className="block hero">
    <div className="block-inner-wrapper">
      <div className="hero-image-wrapper">
        {data.url && (
          <img
            src={`${flattenToAppURL(data.url)}/@@images/image`}
            alt=""
            className="hero-image"
            loading="lazy"
          />
        )}
      </div>
      <div className="hero-body">
        <div className="hero-text">
          {data.title && <h2>{data.title}</h2>}
          {data.description && <p>{data.description}</p>}
        </div>
        <LinkMore data={data} />
      </div>
    </div>
  </div>
);

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
View.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default View;
