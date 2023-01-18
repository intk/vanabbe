import React from 'react';
import { Modal, Image } from 'semantic-ui-react';
import loadable from '@loadable/component';
import { getScaleUrl, getPath } from '@package/utils';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './less/image-gallery.less';

const Slider = loadable(() => import('react-slick'));

const MAX_THUMBS = 4;

const ImageGallery = (props) => {
  const { data = {}, editable = false } = props;
  const { cards, height = '410px' } = data;
  const [open, setOpen] = React.useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(0);
  const sliderRef = React.useRef(null);

  const thumbsToShow = cards?.slice(0, MAX_THUMBS);
  const moreImagesLength =
    cards?.length > MAX_THUMBS ? cards?.length - MAX_THUMBS : null;

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

  return (
    <div className="block image-gallery">
      <div
        tabIndex={0}
        role="button"
        onKeyDown={() => {
          if (!editable) {
            setActiveSlideIndex(0);
            setOpen(true);
          }
        }}
        onClick={() => {
          if (!editable) {
            setActiveSlideIndex(0);
            setOpen(true);
          }
        }}
      >
        {cards?.[0].attachedimage ? (
          <Image
            style={{ height: height }}
            className="bg-image"
            src={getScaleUrl(getPath(cards?.[0].attachedimage), 'large')}
          />
        ) : null}
      </div>

      {thumbsToShow?.length > 1 && (
        <div className="thumbnails">
          {thumbsToShow?.map((thumb, i) => (
            <div
              key={i}
              tabIndex={0}
              role="button"
              onKeyDown={() => {
                if (!editable) {
                  setActiveSlideIndex(i);
                  setOpen(true);
                }
              }}
              onClick={() => {
                if (!editable) {
                  setActiveSlideIndex(i);
                  setOpen(true);
                }
              }}
            >
              <Image
                className="img-thumb"
                src={getScaleUrl(getPath(thumb.attachedimage), 'large')}
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
            {cards?.map((item, i) => {
              return (
                <Image
                  className="modal-slide-img"
                  src={getScaleUrl(getPath(item.attachedimage), 'large')}
                />
              );
            })}
          </Slider>
          <div className="slide-image-count">
            {activeSlideIndex + 1} of {cards?.length}
          </div>
        </Modal.Content>
      </Modal>
    </div>
  );
};

export default ImageGallery;

ImageGallery.schemaExtender = (schema, data, intl) => {
  return {
    ...schema,
    fieldsets: [
      ...schema.fieldsets,
      {
        id: 'imageGallerySettings',
        title: 'Image gallery settings',
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
        default: '300px',
        description: 'Image max height',
      },
    },
  };
};
