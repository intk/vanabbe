import React from 'react';
import { Image, Message } from 'semantic-ui-react';
import { Placeholder } from 'semantic-ui-react';
import { serializeNodes } from '@plone/volto-slate/editor/render';
import { ResponsiveContainer } from '@package/components';
import cx from 'classnames';
// import { getSlideIndex } from './utils';

import loadable from '@loadable/component';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './less/image-carousel.less';

import { ImageCarouselSchema } from './schema';
import { getScaleUrl, getPath } from './utils';

export { ImageCarouselCardSchema } from './schema';

const Slider = loadable(() => import('react-slick'));

const Caption = ({ card }) => {
  const { text } = card;

  return <div className="slide-caption">{!!text && serializeNodes(text)}</div>;
};

const Card = ({ card = {}, height, image_scale, mode = 'view' }) => {
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
  const [slideIndex, setSlideIndex] = React.useState(0);
  const [isClient, setIsClient] = React.useState(false);

  const [sliderNav, setSliderNav] = React.useState(null);
  const [sliderTumbNav, setSliderTumbNav] = React.useState(null);
  const [slider, setSlider] = React.useState(null);
  const [thumbSlider, setThumbSlider] = React.useState(null);

  React.useEffect(() => {
    setSliderNav(slider);
    setSliderTumbNav(thumbSlider);
  }, [slider, thumbSlider]);

  React.useEffect(() => setIsClient(true), []);

  const {
    cards = [],
    hideThumbs,
    height = '510px',
    itemsPerRow = 1,
    autoplay = false,
    autoplaySpeed = 3000,
    image_scale = 'large',
    display = '',
  } = data;

  const slidesToShow = Math.min(cards.length, itemsPerRow);

  const carouselSettings = React.useMemo(
    () => ({
      afterChange: (current) => setSlideIndex(current),
      // speed: 800,
      arrows: false,
      infinite: true,
      slidesToShow,
      slidesToScroll: 1,
      dots: hideThumbs,
      autoplay: autoplay && !editable,
      autoplaySpeed,
      fade: false,
      useTransform: false,
      adaptiveHeight: true,
      lazyLoad: 'ondemand',
      asNavFor: '.slider-nav',

      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(slidesToShow, 3),
            slidesToScroll: Math.min(slidesToShow, 3),
            infinite: true,
            // dots: true,
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
    [autoplay, autoplaySpeed, editable, hideThumbs, slidesToShow],
  );

  const carouselThumbsSettings = {
    slidesToShow: 10,
    slidesToScroll: 1,
    asNavFor: '.slider-for',
    dots: false,
    centerMode: cards.length > 10 ? false : true,
    // swipeToSlide: true,
    infinite: cards.length > 10 ? true : false,
    // infinite: false,
    focusOnSelect: true,
    // centerPadding: '10px',
    // variableWidth: true,
  };

  return !cards.length ? (
    editable ? (
      <Message>No cards</Message>
    ) : (
      ''
    )
  ) : (
    <div
      className={cx(
        'image-carousel default-carousel',
        `image-carousel-${display}`,
      )}
    >
      <ResponsiveContainer>
        {({ parentWidth }) => {
          return (
            parentWidth &&
            isClient && (
              <div
                style={{ width: `${parentWidth}px`, margin: '0 auto' }}
                className={cx({ 'big-carousel': parseInt(itemsPerRow) === 1 })}
              >
                <div ref={sliderRef}>
                  <Slider
                    {...carouselSettings}
                    asNavFor={sliderTumbNav}
                    ref={(slider) => setSlider(slider)}
                  >
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

                {!hideThumbs && (
                  <div className="thumbnail-slider-wrap">
                    <Slider
                      {...carouselThumbsSettings}
                      asNavFor={sliderNav}
                      ref={(slider) => setThumbSlider(slider)}
                    >
                      {cards.map((card, i) => (
                        <Card
                          key={i}
                          mode={editable ? 'edit' : 'view'}
                          card={card}
                          height="54px"
                          image_scale={image_scale}
                        />
                      ))}
                    </Slider>

                    <div className="total">
                      <span>{cards.length}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          );
        }}
      </ResponsiveContainer>

      {!!sliderRef.current && carouselSettings.slidesToShow === 1 && (
        <Caption card={cards[slideIndex]} />
      )}
    </div>
  );
};

ImageCarousel.schemaExtender = (schema, data, intl) => {
  const Custom = ImageCarouselSchema({ data, schema, intl });

  Custom.properties.hideThumbs = {
    type: 'boolean',
    title: 'Hide thumbnail preview',
    default: true,
    description: 'If thumbnail preview is disabled simple dots are shown',
  };

  Custom.fieldsets[0].fields.push('hideThumbs');

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
