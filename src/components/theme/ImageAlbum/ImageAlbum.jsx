import React from 'react';

import { PreviewImage } from '@package/components';
import { Modal } from 'semantic-ui-react';
import loadable from '@loadable/component';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './image-album.less';

const Slider = loadable(() => import('react-slick'));

const MAX_THUMBS = 4;

const ImageAlbum = (props) => {
  const { items = [] } = props;
  const [open, setOpen] = React.useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(0);
  const sliderRef = React.useRef(null);

  const thumbsToShow = items.slice(0, MAX_THUMBS);
  const moreImagesLength =
    items.length > MAX_THUMBS ? items.length - MAX_THUMBS : null;

  const carouselSettings = React.useMemo(
    () => ({
      afterChange: (current) => setActiveSlideIndex(current),
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      dots: false,
      arrows: true,
      autoplay: false,
      fade: false,
      useTransform: false,
      lazyLoad: 'ondemand',
      initialSlide: activeSlideIndex,
    }),
    [activeSlideIndex],
  );

  return (
    <div className="image-album">
      <PreviewImage item={items[0]} size="huge" />

      <div className="thumbnails">
        {thumbsToShow.map((thumb, i) => (
          <div
            tabIndex={0}
            role="button"
            onKeyDown={() => {
              setActiveSlideIndex(i);
              setOpen(true);
            }}
            onClick={() => {
              setActiveSlideIndex(i);
              setOpen(true);
            }}
          >
            <PreviewImage
              key={i}
              item={thumb}
              size="thumb"
              className="img-thumb"
            />
          </div>
        ))}
        {moreImagesLength && (
          <div className="images-number">
            <div>+{moreImagesLength}</div>
          </div>
        )}
      </div>

      <Modal
        closeIcon
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        className="slider-modal"
      >
        <Modal.Content>
          <Slider {...carouselSettings} ref={sliderRef}>
            {items.map((item, i) => (
              <PreviewImage
                key={i}
                item={item}
                size="huge"
                className="modal-slide-img"
              />
            ))}
          </Slider>
          {activeSlideIndex + 1} of {items.length}
        </Modal.Content>
      </Modal>
    </div>
  );
};

export default ImageAlbum;
