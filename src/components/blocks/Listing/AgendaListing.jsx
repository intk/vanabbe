import React from 'react';
import { UniversalLink } from '@plone/volto/components';
import { FormattedDateParts } from 'react-intl';
import { ListingBlockHeader } from '@package/components';

import './less/agenda-listing.less';

const Item = ({ item, hideDate }) => {
  return (
    <div className="agenda-item">
      <UniversalLink item={item} className="agenda-item-link">
        <div className="agenda-wrapper">
          <div>
            <h3 className="agenda-title">{item.title}</h3>
            <div className="agenda-description">{item.description}</div>
          </div>
          <div className="agenda-right">
            {!hideDate && (
              <>
                {item['@type'] === 'Event' ? (
                  <>
                    {!!item.start && (
                      <FormattedDateParts
                        value={new Date(item.start)}
                        year="numeric"
                        month="2-digit"
                        day="2-digit"
                      >
                        {(parts) =>
                          !!parts?.length && (
                            <div>
                              {parts[2].value}.<span>{parts[0].value}</span>.
                              {parts[4].value}
                            </div>
                          )
                        }
                      </FormattedDateParts>
                    )}
                  </>
                ) : (
                  <>
                    {!!item.effective && (
                      <FormattedDateParts
                        value={new Date(item.effective)}
                        year="numeric"
                        month="2-digit"
                        day="2-digit"
                      >
                        {(parts) =>
                          !!parts?.length && (
                            <div>
                              {parts[2].value}.<span>{parts[0].value}</span>.
                              {parts[4].value}
                            </div>
                          )
                        }
                      </FormattedDateParts>
                    )}
                  </>
                )}
              </>
            )}

            <div>
              {!!item.Subject && (
                <>
                  {item.Subject.map((tag, index) => (
                    <React.Fragment key={index}>
                      <span>{tag}</span>
                      {index < item.Subject.length - 1 ? ', ' : ''}
                    </React.Fragment>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
        <span className="arrow down" />
      </UniversalLink>
    </div>
  );
};

const AgendaListingTemplate = (data) => {
  const { items, hideDate } = data;

  return (
    <div className="agenda-listing">
      <div className="agenda-header">
        <ListingBlockHeader data={data} />

        <UniversalLink href={data.linkHref[0]['@id']}>
          {data.linkTitle || '...'}
        </UniversalLink>
      </div>
      <div className="agenda-listing-content">
        {items.map((item, i) => (
          <Item item={item} hideDate={hideDate} key={i} />
        ))}
      </div>
    </div>
  );
};

export default AgendaListingTemplate;
