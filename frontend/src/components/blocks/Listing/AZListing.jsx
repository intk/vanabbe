import { UniversalLink } from '@plone/volto/components';
import { ListingBlockHeader } from '@package/components';
import { HashLink } from 'react-router-hash-link';

import './less/az-listing.less';

const scrollWithOffset = (el) => {
  const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
  const yOffset = -80;
  window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' });
};

const AgendaListingTemplate = (data) => {
  const { items = [], titleField } = data;
  const field = titleField?.value || 'title';
  const groups = items.reduce(
    (acc, item) => ({
      ...acc,
      [(item[field] || item.title)[0].toLowerCase()]: [
        ...(acc[(item[field] || item.title)[0].toLowerCase()] || []),
        item,
      ],
    }),
    {},
  );

  return (
    <div className="az-listing">
      <ListingBlockHeader data={data} />

      <div className="az-listing-nav">
        {Object.keys(groups)
          .sort((a, b) => a.localeCompare(b))
          .map((letter) => (
            <HashLink
              smooth
              key={letter}
              elementId={`g-${letter}`}
              scroll={scrollWithOffset}
            >
              {letter}
            </HashLink>
          ))}
      </div>

      <div className="az-listing-content">
        {Object.keys(groups)
          .sort((a, b) => a.localeCompare(b))
          .map((letter) => (
            <div key={letter}>
              <h4 className="letter" id={`g-${letter}`}>
                {letter}
              </h4>
              <ul
                className={`az-list ${
                  groups[letter].length > 6 ? 'multi-column' : 'single-column'
                }`}
              >
                {groups[letter].map((item) => (
                  <li key={item['@id']}>
                    <UniversalLink item={item}>
                      {item[field] || item.title}
                    </UniversalLink>
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
