import React from 'react';
import loadable from '@loadable/component';
import { Modal, Image } from 'semantic-ui-react';
import { PreviewImage, ArtworkPreviewImage } from '@package/components';
import { flattenToAppURL } from '@plone/volto/helpers';
import { useSelector, useDispatch } from 'react-redux';
import { GET_CONTENT } from '@plone/volto/constants/ActionTypes';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './image-album.less';

const Slider = loadable(() => import('react-slick'));

const MAX_THUMBS = 4;

export function getContent(url, subrequest) {
  const query = { b_size: 1000000 };

  let qs = Object.keys(query)
    .map(function (key) {
      return key + '=' + query[key];
    })
    .join('&');

  return {
    type: GET_CONTENT,
    subrequest,
    request: {
      op: 'get',
      path: `${url}${qs ? `?${qs}` : ''}`,
    },
  };
}

const ImageAlbum = (props) => {
  const { items = [] } = props;
  const pathname = useSelector((state) => state.router.location.pathname);
  const id = `full-items@${pathname}`;

  const selectorItems = useSelector(
    (state) => state.content.subrequests?.[id]?.items,
  );
  const isRequested = !!selectorItems;

  const [albumItems, setAlbumItems] = React.useState(selectorItems || items);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (!isRequested) {
      const action = getContent(pathname, null, id);
      dispatch(action).then((content) => {
        setAlbumItems(content.items);
      });
    }
  }, [dispatch, id, pathname, isRequested]);

  const [open, setOpen] = React.useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(0);
  const sliderRef = React.useRef(null);

  const thumbsToShow = items.slice(1, MAX_THUMBS);
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

  return albumItems.length > 0 ? (
    <div className="image-album">
      <div
        tabIndex={0}
        role="button"
        onKeyDown={handleClick}
        onClick={handleClick}
        className="preview-image-wrapper"
      >
        <ArtworkPreviewImage
          {...props}
          item={items[0]}
          size="huge"
          isFallback={!items.length}
        />
      </div>

      {thumbsToShow.length > 0 && (
        <div className="thumbnails">
          {thumbsToShow.map((thumb, i) => (
            <div
              key={i}
              tabIndex={0}
              role="button"
              onKeyDown={() => {
                setActiveSlideIndex(i + 1);
                setOpen(true);
              }}
              onClick={() => {
                setActiveSlideIndex(i + 1);
                setOpen(true);
              }}
            >
              <PreviewImage
                key={i}
                item={thumb}
                size="mini"
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
  ) : null;
};

export default ImageAlbum;
