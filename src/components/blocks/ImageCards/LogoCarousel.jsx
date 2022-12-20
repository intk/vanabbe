import React from 'react';
import { Image, Message, Popup } from 'semantic-ui-react';
import { Placeholder } from 'semantic-ui-react';
import { ResponsiveContainer } from '@package/components';
import loadable from '@loadable/component';

import { ImageCarouselSchema } from './schema';
import { getScaleUrl, getPath } from './utils';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './less/logo-carousel.less';

export { LogoCardsSchema } from './schema';

const Slider = loadable(() => import('react-slick'));

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

const LogoCardsCarousel = (props) => {
  const { data = {}, editable = false } = props;
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => setIsClient(true), []);
  const {
    cards = [],
    image_scale,
    height = '90px',
    itemsPerRow = 8,
    autoplay = false,
    autoplaySpeed = 3000,
    hideNavigationDots,
  } = data;

  const slidesToShow = Math.min(cards.length, itemsPerRow);

  const carouselSettings = React.useMemo(
    () => ({
      // speed: 800,
      infinite: false,
      slidesToShow,
      slidesToScroll: 1,
      dots: itemsPerRow > 1 && !hideNavigationDots,
      arrows: false,
      autoplay: itemsPerRow > 1 && autoplay && !editable,
      autoplaySpeed,
      fade: false,
      useTransform: false,
      lazyLoad: 'ondemand',

      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(slidesToShow, 3),
            slidesToScroll: Math.min(slidesToShow, 3),
            infinite: true,
            dots: true,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: Math.min(slidesToShow, 2),
            slidesToScroll: Math.min(slidesToShow, 2),
            initialSlide: Math.min(slidesToShow, 2),
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    }),
    [
      autoplay,
      autoplaySpeed,
      editable,
      hideNavigationDots,
      itemsPerRow,
      slidesToShow,
    ],
  );

  return !cards.length ? (
    editable ? (
      <Message>No cards</Message>
    ) : (
      ''
    )
  ) : (
    <div className="logo-carousel">
      <ResponsiveContainer>
        {({ parentWidth }) => {
          return parentWidth && isClient ? (
            <div style={{ width: `${parentWidth - 100}px` }}>
              <Slider {...carouselSettings}>
                {cards.map((card, i) => (
                  <Card
                    key={i}
                    mode={editable ? 'edit' : 'view'}
                    card={card}
                    height={height}
                    image_scale={image_scale}
                  />
                ))}
              </Slider>
            </div>
          ) : (
            ''
          );
        }}
      </ResponsiveContainer>
    </div>
  );
};

LogoCardsCarousel.schemaExtender = (schema, data, intl) => {
  const Custom = ImageCarouselSchema({ data, schema, intl });
  return {
    ...schema,
    ...Custom,
    properties: { ...schema.properties, ...Custom.properties },
    fieldsets: [
      // { id: 'empty', fields: [] },
      ...schema.fieldsets,
      ...Custom.fieldsets,
    ],
  };
};

export default LogoCardsCarousel;
