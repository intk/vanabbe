import React from 'react';
import { UniversalLink } from '@plone/volto/components';
import { ListingBlockHeader, FormattedDate } from '@package/components';
import { When } from '@plone/volto/components/theme/View/EventDatesInfo';
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
                  <When
                    start={item.start}
                    end={item.end}
                    whole_day={true}
                    open_end={item.open_end}
                  />
                ) : (
                  <>
                    {item.EffectiveDate !== 'None' ? (
                      <FormattedDate
                        isoDate={item.EffectiveDate}
                        format="long"
                      />
                    ) : null}
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
  const { items, hideDate, linkHref } = data;

  return (
    <div className="agenda-listing">
      <div className="listing-header">
        <ListingBlockHeader data={data} />

        {linkHref && (
          <UniversalLink href={linkHref?.[0]['@id']}>
            {data.linkTitle || '...'}
          </UniversalLink>
        )}
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
