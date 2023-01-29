import React from 'react';
import PropTypes from 'prop-types';
import loadable from '@loadable/component';
import { BodyClass } from '@plone/volto/helpers';
import { LinkMore, UniversalLink } from '@plone/volto/components';
import { ListingBlockHeader } from '@package/components';
import config from '@plone/volto/registry';

import Card from './ListingCard';
import './less/search-listing.less';

const Masonry = loadable(() => import('react-masonry-css'));

const SearchListingTemplate = (props) => {
  const { items, linkHref, linkTitle } = props;
  const { breakpointColumnsObj } = config.settings;

  return (
    <>
      <BodyClass className="has-search-listing" />
      <div className="listing-header">
        <ListingBlockHeader data={props} />

        {linkHref && (
          <UniversalLink href={linkHref?.[0]['@id']}>
            {linkTitle || '...'}
          </UniversalLink>
        )}
      </div>

      <div className="masonry-layout-listing">
        <div className="listings">
          <div className="listings ">
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="masonry-grid"
              columnClassName="masonry-grid_column"
            >
              {items.map((item, i) => (
                <div className="listing-column" key={i}>
                  <Card item={item} {...props} />
                </div>
              ))}
            </Masonry>
          </div>
        </div>
        {props.linkHref ? <LinkMore data={props} /> : ''}
      </div>
    </>
  );
};

SearchListingTemplate.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default SearchListingTemplate;
