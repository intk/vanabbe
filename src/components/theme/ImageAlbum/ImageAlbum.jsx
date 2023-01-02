import React from 'react';

import { Message } from 'semantic-ui-react';
import { serializeNodes } from '@plone/volto-slate/editor/render';
import { PreviewImage, ResponsiveContainer } from '@package/components';
import cx from 'classnames';
// import { getSlideIndex } from './utils';

import loadable from '@loadable/component';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import {
  getScaleUrl,
  getPath,
} from '@package/components/blocks/ImageCards/utils';

import './image-album.less';

const Slider = loadable(() => import('react-slick'));

const Caption = ({ card }) => {
  const { text } = card;

  return <div className="slide-caption">{!!text && serializeNodes(text)}</div>;
};

const ImageAlbum = (props) => {
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
                      <PreviewImage
                        key={i}
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
                        <PreviewImage
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

export default ImageAlbum;
