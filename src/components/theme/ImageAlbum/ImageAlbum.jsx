import React from 'react';
import { Modal, Image } from 'semantic-ui-react';
import { PreviewImage } from '@package/components';
import { flattenToAppURL } from '@plone/volto/helpers';
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
      adaptiveHeight: true,
      autoplay: false,
      fade: false,
      useTransform: false,
      lazyLoad: 'ondemand',
      initialSlide: activeSlideIndex,
    }),
    [activeSlideIndex],
  );

  const handleClick = () => {
    if (items.length) {
      setActiveSlideIndex(0);
      setOpen(true);
    }
  };

  return (
    <div className="image-album">
      <div
        tabIndex={0}
        role="button"
        onKeyDown={handleClick}
        onClick={handleClick}
        className="preview-image-wrapper"
      >
        <PreviewImage item={items[0]} size="huge" isFallback={!items.length} />
      </div>

      {thumbsToShow.length > 1 && (
        <div className="thumbnails">
          {thumbsToShow.map((thumb, i) => (
            <div
              key={i}
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
                size="small"
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
      )}

      <Modal
        closeIcon
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        className="slider-modal"
      >
        <Modal.Content>
          <Slider {...carouselSettings} ref={sliderRef}>
            {items.map((item, i) => {
              return (
                <Image
                  key={i}
                  src={
                    item
                      ? flattenToAppURL(
                          `${item?.['@id']}/@@${'images'}/${
                            item?.image_field || 'preview_image'
                          }/large`,
                        )
                      : ''
                  }
                  alt={item?.title}
                  className="modal-slide-img"
                />
              );
            })}
          </Slider>
          <div className="slide-image-count">
            {activeSlideIndex + 1} of {items.length}
          </div>
        </Modal.Content>
      </Modal>
    </div>
  );
};

export default ImageAlbum;
