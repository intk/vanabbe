import React from 'react';

import { PreviewImage, ResponsiveContainer } from '@package/components';
import cx from 'classnames';

import loadable from '@loadable/component';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import './image-album.less';

const Slider = loadable(() => import('react-slick'));

const ImageAlbum = (props) => {
  const {
    items = [],
    hideThumbs,
    itemsPerRow = 1,
    autoplay = false,
    autoplaySpeed = 3000,
  } = props;
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

  const slidesToShow = Math.min(items.length, itemsPerRow);

  const carouselSettings = React.useMemo(
    () => ({
      afterChange: (current) => setSlideIndex(current),
      // speed: 800,
      arrows: false,
      infinite: true,
      slidesToShow,
      slidesToScroll: 1,
      dots: hideThumbs,
      autoplay,
      autoplaySpeed,
      fade: false,
      useTransform: false,
      adaptiveHeight: true,
      lazyLoad: 'ondemand',
      asNavFor: '.slider-nav',

      // responsive: [
      //   {
      //     breakpoint: 1024,
      //     settings: {
      //       slidesToShow: Math.min(slidesToShow, 3),
      //       slidesToScroll: Math.min(slidesToShow, 3),
      //       infinite: true,
      //       // dots: true,
      //     },
      //   },
      //   {
      //     breakpoint: 800,
      //     settings: {
      //       slidesToShow: Math.min(slidesToShow, 2),
      //       slidesToScroll: Math.min(slidesToShow, 2),
      //       initialSlide: Math.min(slidesToShow, 2),
      //     },
      //   },
      //   {
      //     breakpoint: 480,
      //     settings: {
      //       slidesToShow: 1,
      //       slidesToScroll: 1,
      //     },
      //   },
      // ],
    }),
    [autoplay, autoplaySpeed, hideThumbs, slidesToShow],
  );

  const carouselThumbsSettings = {
    slidesToShow: 10,
    slidesToScroll: 1,
    dots: false,
    centerMode: items.length > 10 ? false : true,
    infinite: items.length > 10 ? true : false,
    focusOnSelect: true,
    // swipeToSlide: true,
    // infinite: false,
    // centerPadding: '10px',
    // variableWidth: true,
  };

  return (
    <div className="image-album">
      <ResponsiveContainer>
        {({ parentWidth }) => {
          return (
            parentWidth &&
            isClient && (
              <div style={{ width: `${parentWidth}px`, margin: '0' }}>
                <div ref={sliderRef} className="main-slider">
                  <Slider
                    {...carouselSettings}
                    asNavFor={sliderTumbNav}
                    ref={(slider) => setSlider(slider)}
                  >
                    {items.map((card, i) => (
                      <PreviewImage item={card} key={i} size="huge" />
                    ))}
                  </Slider>
                </div>

                <div className="thumbnail-slider-wrap">
                  <Slider
                    {...carouselThumbsSettings}
                    asNavFor={sliderNav}
                    ref={(slider) => setThumbSlider(slider)}
                  >
                    {items.map((card, i) => (
                      <PreviewImage
                        key={i}
                        item={card}
                        size="thumb"
                        className="slide-img"
                      />
                    ))}
                  </Slider>
                </div>
              </div>
            )
          );
        }}
      </ResponsiveContainer>
    </div>
  );
};

export default ImageAlbum;
