/**
 * View image block.
 * @module components/manage/Blocks/Hero/View
 */

import React from 'react';
import PropTypes from 'prop-types';
import { flattenToAppURL } from '@plone/volto/helpers';
import { LinkMore } from '@plone/volto/components';
import VisibilitySensor from 'react-visibility-sensor';
import cx from 'classnames';

/**
 * View image block class.
 * @class View
 * @extends Component
 */
const View = ({ data }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <VisibilitySensor
      partialVisibility
      onChange={(isVisible) => {
        setIsVisible(isVisible);
      }}
    >
      <div
        className={cx(
          'styled-hero full align styled full-width',
          isVisible ? 'visible' : '',
        )}
      >
        <div className="block hero">
          <div className="block-inner-wrapper">
            <div className="overlay"></div>
            {data.url && (
              <div
                className="hero-block-image"
                style={{
                  backgroundImage: `url(${flattenToAppURL(
                    data.url,
                  )}/@@images/image)`,
                }}
              />
            )}
            <div className="ui container hero-content-wrapper">
              <div className="hero-body">
                {data.description && <span>{data.description}</span>}
                {data.title && <h1>{data.title}</h1>}
                <LinkMore data={data} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </VisibilitySensor>
  );
};

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
View.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default View;
