import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl'; // defineMessages
import { Image, Message, Button } from 'semantic-ui-react';
import { ListingBlockHeader } from '@package/components';
import { Placeholder, Modal, Icon } from 'semantic-ui-react';
import { UniversalLink } from '@plone/volto/components';
import { SliderNavigation } from '@package/components/blocks/Listing/SliderListing';
import { ResponsiveContainer } from '@package/components';
import { BodyClass } from '@plone/volto/helpers';
import cx from 'classnames';

import loadable from '@loadable/component';

import 'slick-carousel/slick/slick.css';
import './less/splashy-carousel.less';
import 'slick-carousel/slick/slick-theme.css';

import { useWindowDimensions } from '@package/helpers';

import { getScaleUrl, getPath } from './utils';
export { SplashyCarouselSchema } from './schema';

const Slider = loadable(() => import('react-slick'));

const getEmbedUrl = (url) => {
  let videoId;

  if (url.match('vimeo')) {
    videoId = url.match(/^.*\.com\/(.*)/)[1];
    return [
      `//player.vimeo.com/video/${videoId}`,
      '?api=false',
      `&amp;autoplay=true`,
      '&amp;byline=false',
      '&amp;portrait=false',
      '&amp;title=false',
    ].join('');
  }
  videoId = url.match(/.be\//)
    ? url.match(/^.*\.be\/(.*)/)[1]
    : url.match(/^.*\?v=(.*)$/)[1];

  return `https://www.youtube.com/embed/${videoId}?autoplay=0`;
};

const VideoEmbed = ({ url, height, width }) => {
  if (!url) return null;
  const embedUrl = getEmbedUrl(url);

  return (
    <div className="video-responsive">
      <iframe
        width={width}
        height={height}
        src={embedUrl}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; "
        allowFullScreen
        title="Embedded video"
      />
    </div>
  );
};

const Card = ({ card = {}, height, image_scale, mode = 'view' }) => {
  const { title, subTitle, linkHref, linkTitle } = card;

  const embedSettings = {
    url: card.videoUrl,
    height: '500px',
    width: '100%',
  };

  const [open, setOpen] = React.useState(false);

  return (
    <div className="slide-img" style={{ height }}>
      {card.attachedimage ? (
        <>
          <Image
            className="bg-image"
            src={getScaleUrl(
              getPath(card.attachedimage),
              image_scale || 'large',
            )}
          />
          <div className="slide-overlay" />
          <div className="ui container">
            <div className="caption">
              <h3 className="title">{title}</h3>
              <h1 className="sub-title">{subTitle}</h1>

              <div className="slide-button">
                {!!linkHref?.[0] && (
                  <UniversalLink
                    href={linkHref[0]['@id']}
                    className="ui button primary"
                  >
                    {linkTitle || '...'}
                  </UniversalLink>
                )}
                {card.videoUrl && (
                  <Modal
                    className="embed-modal"
                    onClose={() => setOpen(false)}
                    onOpen={() => setOpen(true)}
                    open={open}
                    trigger={
                      <Button className="popup-video">
                        <FormattedMessage
                          id="Watch The Video"
                          defaultMessage="Watch The Video"
                        />
                        <Icon name="play" />
                      </Button>
                    }
                  >
                    <Modal.Content>
                      <VideoEmbed {...embedSettings} />
                    </Modal.Content>
                  </Modal>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <Placeholder />
      )}
    </div>
  );
};

const SplashyCarousel = (props) => {
  const { data = {}, editable = false } = props;
  const sliderRef = React.useRef();
  const [isClient, setIsClient] = React.useState(false);
  const { windowHeight } = useWindowDimensions();

  React.useEffect(() => setIsClient(true), []);
  const {
    cards = [],
    // height = '233px',
    itemsPerRow = 1,
    hideNavigationDots = true,
    autoplay = false,
    autoplaySpeed = 3000,
    image_scale = 'large',
    display = '',
  } = data;

  const carouselSettings = React.useMemo(
    () => ({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      dots: itemsPerRow > 1 && !hideNavigationDots,
      autoplay: itemsPerRow > 1 && autoplay && !editable,
      autoplaySpeed,
      fade: false,
      arrows: false,
      useTransform: false,
      adaptiveHeight: true,
      lazyLoad: 'ondemand',
    }),
    [autoplay, autoplaySpeed, editable, hideNavigationDots, itemsPerRow],
  );

  return !cards.length ? (
    editable ? (
      <Message>No cards</Message>
    ) : (
      ''
    )
  ) : (
    <div className="full-width">
      <BodyClass className="has-splashy-carousel" />
      <div
        className={cx(
          'image-carousel splashy-carousel',
          `image-carousel-${display}`,
        )}
      >
        <ListingBlockHeader data={data} />

        <ResponsiveContainer>
          {({ parentWidth }) => {
            return (
              parentWidth &&
              isClient && (
                <div style={{ width: `${parentWidth}px`, margin: '0 auto' }}>
                  {cards.length > itemsPerRow && (
                    <div className="slider-carousel-navigation">
                      <div className="ui container">
                        <SliderNavigation
                          sliderRef={sliderRef}
                          slideCount={cards.length}
                          settings={carouselSettings}
                        />
                      </div>
                    </div>
                  )}
                  <Slider {...carouselSettings} ref={sliderRef}>
                    {cards.map((card, i) => (
                      <Card
                        key={i}
                        mode={editable ? 'edit' : 'view'}
                        card={card}
                        height={windowHeight}
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
    </div>
  );
};

export default injectIntl(SplashyCarousel);
