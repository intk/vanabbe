import React, { useState, useEffect } from 'react';
import loadable from '@loadable/component';
import { Image } from 'semantic-ui-react';
import { UniversalLink, Logo, Icon } from '@plone/volto/components';
import { getScaleUrl, getPath } from '@package/utils';
import { useWindowDimensions } from '@package/helpers';
import logoImage from '../../../icons/vanabbe.svg';

import './style.less';

const ReactYoutubePlayer = loadable(() => import('react-player/youtube'));
const ReactVimeoPlayer = loadable(() => import('react-player/vimeo'));

const VideoPlayer = (props) => {
  const { playing, videoUrl } = props;
  const vimeoURL = videoUrl?.match('vimeo');
  const youtubeURL = videoUrl?.match(/youtube|.be\//);

  const playerProps = {
    muted: true, // in some browsers (e.g. Chrome) autoplay doesn't work if no muted attribute is present
    playing: playing,
    controls: true,
    url: videoUrl,
    width: '100%',
    height: '100%',
  };

  return (
    <>
      {vimeoURL ? (
        <ReactVimeoPlayer {...playerProps} />
      ) : youtubeURL ? (
        <ReactYoutubePlayer {...playerProps} />
      ) : null}
    </>
  );
};

const HeroUnitView = (props) => {
  const { data = {}, mode = 'view' } = props;
  const {
    headline,
    buttonText,
    headlineTag,
    videoUrl,
    linkHref,
    attachedimage,
  } = data;

  const HeadlineTag = headlineTag || 'h2';
  const isView = mode === 'edit';
  const href = linkHref?.[0]?.['@id'] || '';

  const boxRef = React.useRef();
  const { windowHeight } = useWindowDimensions();

  const [isActive, setActive] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [scrollBottom, setScrollBottom] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [top, setTop] = useState();

  useEffect(() => {
    function onScroll() {
      let currentPosition = window.pageYOffset;
      if (currentPosition > scrollBottom) {
        setScrolling(true);
        setTop(windowHeight - 150);
      } else {
        setScrolling(false);
      }
      setScrollBottom(currentPosition <= 0 ? 0 : currentPosition);
    }

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollBottom, windowHeight]);

  useEffect(() => {
    const position = boxRef.current.getBoundingClientRect().top;

    if (!isView && scrolling) {
      setPlaying(true);
      setActive(true);
    } else {
      setTop(position + window.scrollY);
    }
  }, [scrolling, isView]);

  const getPosition = () => {
    const position = boxRef.current.getBoundingClientRect().top;
    setTop(position);
  };

  useEffect(() => {
    getPosition();
  }, []);

  useEffect(() => {
    window.addEventListener('resize', getPosition);
    return () => window.addEventListener('resize', getPosition);
  }, []);

  return (
    <div className={`hero-unit-block ${isActive ? 'big-hero' : 'normal-hero'}`}>
      <div>
        <HeadlineTag className="hero-unit-title">{headline}</HeadlineTag>
        <div className="hero-unit-wrapper">
          <div className={`hero-unit-image-wrapper ${videoUrl ? 'video' : ''}`}>
            {videoUrl && <VideoPlayer playing={playing} videoUrl={videoUrl} />}

            {attachedimage && (
              <Image
                className="hero-unit-image"
                onClick={() => setActive(true)}
                src={getScaleUrl(getPath(attachedimage), 'large')}
              />
            )}

            {buttonText && buttonText && (
              <UniversalLink href={href} className="hero-unit-content">
                {buttonText}
              </UniversalLink>
            )}
          </div>

          <div
            className={`hero-logo-wrapper ${
              scrolling ? 'logo-bottom' : 'logo-top'
            }`}
          >
            <div className="hidden" ref={boxRef}>
              <Logo />
            </div>
            <div className="visible">
              <div className="logo">
                <Icon name={logoImage} style={{ top: top }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroUnitView;
