import React from 'react';
import { flattenToAppURL } from '@plone/volto/helpers';
import { Link } from 'react-router-dom';
import { FormattedTime, FormattedDateParts } from 'react-intl';
import { FormattedDate } from '@package/components';

// see extras/listing.less for less
function PreviewImage(props) {
  const { item, size = 'preview', alt, isFallback = false, ...rest } = props;

  // const src = item.image_field
  //   ? flattenToAppURL(`${item['@id']}/@@images/${item.image_field}/${size}`)
  //   : DefaultImageSVG;

  const url = flattenToAppURL(
    `${item['@id']}/@@${isFallback ? 'fallback-image' : 'images'}/${
      item.image_field || 'preview_image'
    }/${size}`,
  );

  return <img src={url} alt={alt ?? item.title} {...rest} />;
}

const Card = ({ item }) => {
  const { image_field } = item;
  const size = 'large';
  // {!!item.effective && <FormattedDate isoDate={item.effective} />}
  return (
    <section className="listing-card default-card">
      <Link
        className="card-link"
        to={flattenToAppURL(item['@id'])}
        title={item.title}
      >
        <div className="card-details">
          <h3 className="card-title">{item.title}</h3>
          {!!image_field && (
            <div className="image-wrapper">
              <PreviewImage item={item} size={size} isFallback={!image_field} />
            </div>
          )}
          <p className="card-description">{item.description}</p>
        </div>
      </Link>
    </section>
  );
};

const NewsItemCard = ({ item }) => {
  const { image_field } = item;
  const size = 'large';
  return (
    <section className="listing-card newsitem-card default-card">
      <Link
        className="card-link"
        to={flattenToAppURL(item['@id'])}
        title={item.title}
      >
        <div className="card-details">
          {!!item.effective && (
            <FormattedDate isoDate={item.effective} format="long" />
          )}
          <h3 className="card-title">{item.title}</h3>
          {!!image_field && (
            <div className="image-wrapper">
              <PreviewImage item={item} size={size} isFallback={!image_field} />
            </div>
          )}
          <p className="card-description">{item.description}</p>
        </div>
      </Link>
    </section>
  );
};

const EventCard = ({ item }) => {
  const { image_field } = item;
  const size = 'large';

  return item.start ? (
    <section className="listing-card event-card default-card">
      <Link
        className="card-link"
        to={flattenToAppURL(item['@id'])}
        title={item.title}
      >
        <div className="card-details">
          <div className="date">
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
            <FormattedTime value={new Date(item.start)} />
          </div>
          <h3 className="card-title">{item.title}</h3>
          {!!image_field && (
            <div className="image-wrapper">
              <PreviewImage item={item} size={size} isFallback={!image_field} />
            </div>
          )}
          <p className="card-description">{item.description}</p>
        </div>
      </Link>
    </section>
  ) : (
    <Card item={item} />
  );
};

const cardTypes = {
  default: Card,
  'News Item': NewsItemCard,
  Event: EventCard,
};

const UniversalCard = ({ item }) => {
  const CardImpl = cardTypes[item['@type']] || cardTypes['default'];
  return <CardImpl item={item} />;
};

export default UniversalCard;
