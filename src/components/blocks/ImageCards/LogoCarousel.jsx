import React from 'react';
import { Image, Message, Popup } from 'semantic-ui-react';
import { Placeholder } from 'semantic-ui-react';
import { getScaleUrl, getPath } from '@package/utils';
import './less/logo-cards.less';

export { LogoCardsSchema } from './schema';

const Card = ({ card = {}, height, image_scale, mode = 'view' }) => {
  const { link, title } = card;

  const LinkWrapper =
    link && mode === 'view'
      ? ({ children }) => (
          <a href={link} target="_blank" rel="noreferrer" title={title}>
            {children}
          </a>
        )
      : ({ children }) => children;
  const PopupWrapper = title
    ? ({ children }) => <Popup content={title} trigger={children} on="hover" />
    : ({ children }) => children;

  return (
    <div className="logo-slide-img" style={{ height, width: height }}>
      <PopupWrapper>
        <LinkWrapper>
          {card.attachedimage ? (
            <Image
              style={{ height: height }}
              className="bg-image"
              src={getScaleUrl(
                getPath(card.attachedimage),
                image_scale || 'large',
              )}
            />
          ) : (
            <Placeholder />
          )}
        </LinkWrapper>
      </PopupWrapper>
    </div>
  );
};

const LogoCards = (props) => {
  const { data = {}, editable = false } = props;
  const { cards = [], image_scale, height = '80px' } = data;

  return !cards.length ? (
    editable ? (
      <Message>No cards</Message>
    ) : (
      ''
    )
  ) : (
    <div className="logo-carousel">
      {cards.map((card, i) => (
        <Card
          key={i}
          mode={editable ? 'edit' : 'view'}
          card={card}
          height={height}
          image_scale={image_scale}
        />
      ))}
    </div>
  );
};

LogoCards.schemaExtender = (schema, data, intl) => {
  return {
    ...schema,
    fieldsets: [
      ...schema.fieldsets,
      {
        id: 'logoCardsSettings',
        title: 'Logo cards settings',
        fields: ['height'],
      },
    ],
    properties: {
      ...schema.properties,
      height: {
        title: (
          <a
            rel="noreferrer"
            target="_blank"
            href="https://developer.mozilla.org/en-US/docs/Web/CSS/height"
          >
            CSS height
          </a>
        ),
        default: '80px',
        description: 'Image max height',
      },
    },
  };
};

export default LogoCards;
