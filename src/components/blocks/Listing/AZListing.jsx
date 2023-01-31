import { UniversalLink } from '@plone/volto/components';
import { ListingBlockHeader } from '@package/components';

const AgendaListingTemplate = (data) => {
  const { items = [], linkHref } = data;
  // {items.map((item, i) => (
  //   <Item item={item} showDate={showDate} key={i} />
  // ))}
  console.log('items', items);
  const groups = items.reduce(
    (acc, item) => ({
      ...acc,
      [item.title[0].toLowerCase()]: [
        ...(acc[item.title[0].toLowerCase()] || []),
        item,
      ],
    }),
    {},
  );

  return (
    <div className="az-listing">
      <div className="listing-header">
        <ListingBlockHeader data={data} />

        {linkHref && (
          <UniversalLink href={linkHref?.[0]['@id']}>
            {data.linkTitle || '...'}
          </UniversalLink>
        )}

        <div className="az-listing-nav">
          {Object.keys(groups)
            .sort()
            .map((letter) => (
              <a key={letter} href={`#g-${letter}`}>
                {letter}
              </a>
            ))}
        </div>
      </div>

      <div className="az-listing-content">
        {Object.keys(groups)
          .sort()
          .map((letter) => (
            <div key={letter}>
              <h4 id={`g-${letter}`}>{letter}</h4>
              <ul>
                {groups[letter].map((item) => (
                  <li key={item['@id']}>
                    <UniversalLink item={item}>{item.title}</UniversalLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AgendaListingTemplate;
