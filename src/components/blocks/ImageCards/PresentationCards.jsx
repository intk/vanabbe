import React from 'react';
import { Message, Card } from 'semantic-ui-react';
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
import { getScaleUrl, getPath } from '@package/utils';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './less/presentation-cards.less';

const Slider = loadable(() => import('react-slick'));

const CardItem = ({ card = {}, image_scale, mode }) => {
  const { link, title } = card;

  const LinkWrapper = React.useMemo(
    () =>
      link && mode === 'view'
        ? ({ children }) => (
            <a href={link} target="_blank" rel="noreferrer" title={title}>
              {children}
            </a>
          )
        : ({ children }) => children,
    [link, mode, title],
  );

  return (
    <div className="slide-img">
      <LinkWrapper>
        {card.attachedimage ? (
          <Card className="presentation-card">
            <div
              className="presentation-card-image"
              style={{
                backgroundImage: `url(${getScaleUrl(
                  getPath(card.attachedimage),
                  image_scale || 'large',
                )})`,
              }}
            ></div>
            <Card.Content>
              {!!card.title && <h3>{card.title}</h3>}
              <Card.Description>
                {!!card.text && serializeNodes(card.text)}
              </Card.Description>
            </Card.Content>
          </Card>
        ) : (
          <Placeholder />
        )}
      </LinkWrapper>
    </div>
  );
};

const PresentationCards = (props) => {
  const { data = {}, editable = false } = props;
  const sliderRef = React.useRef();
  // const [slideIndex, setSlideIndex] = React.useState(0);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => setIsClient(true), []);
  const {
    cards = [],
    itemsPerRow = 4,
    autoplay = false,
    autoplaySpeed = 3000,
    image_scale = 'large',
    hideNavigationDots,
    display = '',
  } = data;

  const slidesToShow = Math.min(cards.length, itemsPerRow);

  const carouselSettings = React.useMemo(
    () => ({
      // afterChange: (current) => setSlideIndex(current),
      infinite: true,
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
          breakpoint: 800,
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
      itemsPerRow,
      slidesToShow,
      hideNavigationDots,
    ],
  );
  // const currentSlide = getSlideIndex(sliderRef, slideIndex, carouselSettings);

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
                <Slider {...carouselSettings} ref={sliderRef}>
                  {cards.map((card, i) => (
                    <CardItem
                      key={i}
                      mode={editable ? 'edit' : 'view'}
                      card={card}
                      image_scale={image_scale}
                    />
                  ))}
                </Slider>
              </div>
            )
          );
        }}
      </ResponsiveContainer>
      {/* <Pagination slideIndex={slideIndex + 1} slideCount={cards.length} /> */}
    </div>
  );
};

PresentationCards.schemaExtender = (schema, data, intl) => {
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

export default PresentationCards;
