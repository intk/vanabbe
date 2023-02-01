import { UniversalLink, Icon } from '@plone/volto/components';
import { ListingBlockHeader } from '@package/components';

import aheadSVG from '@plone/volto/icons/ahead.svg';

const SimpleLinks = (data) => {
  const { items = [], linkHref } = data;
  return (
    <div className="simplelinks-listing">
      <div className="listing-header">
        <ListingBlockHeader data={data} />

        {linkHref && (
          <UniversalLink href={linkHref?.[0]['@id']}>
            {data.linkTitle || '...'}
          </UniversalLink>
        )}
      </div>
      <div className="simplelinks-content">
        {items.map((item) => (
          <div key={item['@id']} className="simplelink-item">
            <span>
              <UniversalLink item={item}>{item.title}</UniversalLink>
            </span>
            <Icon name={aheadSVG} size="45px" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleLinks;
