import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedTime } from 'react-intl';
import { flattenToAppURL } from '@plone/volto/helpers';
import { FormattedDate } from '@plone/volto/components';
import { PreviewImage } from '@package/components';

const dateOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const Card = ({ item }) => {
  const { image_field } = item;
  const size = 'large';
  return (
    <section className="listing-card default-card">
      <Link className="card-link" to={flattenToAppURL(item['@id'])}>
        <div className="card-details">
          <div className="card-content">
            <h3 className="card-title">{item.title}</h3>

            {!!image_field && (
              <div className="image-wrapper mobile tablet only">
                <PreviewImage
                  item={item}
                  size={size}
                  isFallback={!image_field}
                />
              </div>
            )}
            {!!item.description && (
              <p className="card-description">{item.description}</p>
            )}
          </div>
          <div className="computer large screen widescreen only">
            {!!image_field && (
              <div className="image-wrapper">
                <PreviewImage
                  item={item}
                  size={size}
                  isFallback={!image_field}
                />
              </div>
            )}
          </div>
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
          <div className="card-content">
            <div className="date">
              {!!item.effective && (
                <FormattedDate date={item.effective} format={dateOptions} />
              )}
            </div>
            <h3 className="card-title">{item.title}</h3>

            {!!image_field && (
              <div className="image-wrapper mobile tablet only">
                <PreviewImage
                  item={item}
                  size={size}
                  isFallback={!image_field}
                />
              </div>
            )}

            <p className="card-description">{item.description}</p>
          </div>
          <div className="computer large screen widescreen only">
            {!!image_field && (
              <div className="image-wrapper">
                <PreviewImage
                  item={item}
                  size={size}
                  isFallback={!image_field}
                />
              </div>
            )}
          </div>
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
          <div className="card-content">
            <div className="card-meta date">
              {!!item.effective && (
                <FormattedDate date={item.start} format={dateOptions} />
              )}
              {!!item.start && <FormattedTime value={new Date(item.start)} />}
            </div>
            <h3 className="card-title">{item.title}</h3>

            {!!image_field && (
              <div className="image-wrapper mobile tablet only">
                <PreviewImage
                  item={item}
                  size={size}
                  isFallback={!image_field}
                />
              </div>
            )}

            <p className="card-description">{item.description}</p>
          </div>
          <div className="computer large screen widescreen only">
            {!!image_field && (
              <div className="image-wrapper">
                <PreviewImage
                  item={item}
                  size={size}
                  isFallback={!image_field}
                />
              </div>
            )}
          </div>
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
