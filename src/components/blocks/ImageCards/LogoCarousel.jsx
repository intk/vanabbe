import React from 'react';
import { Image, Message } from 'semantic-ui-react';
import { ListingBlockHeader } from '@package/components';
import { Placeholder } from 'semantic-ui-react';
import { serializeNodes } from '@plone/volto-slate/editor/render';
import { ResponsiveContainer } from '@package/components';
import cx from 'classnames';

import loadable from '@loadable/component';

import {
  // Pagination,
  SliderNavigation,
} from '@package/components/blocks/Listing/SliderListing';
import { ImageCarouselSchema } from './schema';
import { getScaleUrl, getPath } from './utils';

import 'slick-carousel/slick/slick.css';
import './less/image-carousel.less';
import 'slick-carousel/slick/slick-theme.css';

export { LogoCardsSchema } from './schema';

const Slider = loadable(() => import('react-slick'));

const Card = ({ card = {}, height, image_scale, mode = 'view' }) => {
  const { linkHref, title } = card;

  const LinkWrapper = React.useMemo(
    () =>
      linkHref && mode === 'view'
        ? ({ children }) => (
            <a
              className="card-link"
              href={linkHref}
              target="_blank"
              rel="noreferrer"
              title={title}
            >
              {children}
            </a>
          )
        : ({ children }) => children,
    [linkHref, mode, title],
  );

  return (
    <div className="slide-img" style={{ height }}>
      <LinkWrapper>
        {card.attachedimage ? (
          <Image
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
    </div>
  );
};

const ImageCarousel = (props) => {
  const { data = {}, editable = false } = props;
  const sliderRef = React.useRef();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => setIsClient(true), []);
  const {
    text,
    cards = [],
    height = '233px',
    itemsPerRow = 4,
    autoplay = false,
    autoplaySpeed = 3000,
    image_scale = 'large',
    display = '',
  } = data;

  const slidesToShow = Math.min(cards.length, itemsPerRow);

  const carouselSettings = React.useMemo(
    () => ({
      // speed: 800,
      infinite: true,
      slidesToShow,
      slidesToScroll: 1,
      dots: false, // itemsPerRow > 1 && !hideNavigationDots
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
    [autoplay, autoplaySpeed, editable, itemsPerRow, slidesToShow],
  );

  return !cards.length ? (
    editable ? (
      <Message>No cards</Message>
    ) : (
      ''
    )
  ) : (
    <div
      className={cx(
        'image-carousel',
        `image-carousel-${display}`,
        'slider-listing',
      )}
    >
      <ResponsiveContainer>
        {({ parentWidth }) => {
          return (
            parentWidth &&
            isClient && (
              <div style={{ width: `${parentWidth}px`, margin: '0 auto' }}>
                <ListingBlockHeader data={data}>
                  {cards.length > itemsPerRow && (
                    <SliderNavigation
                      sliderRef={sliderRef}
                      slideCount={cards.length}
                      settings={carouselSettings}
                      // slideIndex={currentSlide}
                    />
                  )}
                </ListingBlockHeader>
                {!!text && serializeNodes(text)}
                <Slider {...carouselSettings} ref={sliderRef}>
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
            )
          );
        }}
      </ResponsiveContainer>
    </div>
  );
};

ImageCarousel.schemaExtender = (schema, data, intl) => {
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

export default ImageCarousel;
