import { UniversalLink } from '@plone/volto/components';
import { ListingBlockHeader } from '@package/components';

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
        <ul>
          {items.map((item) => (
            <li key={item['@id']}>
              <UniversalLink item={item}>{item.title}</UniversalLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SimpleLinks;
