import React, { useState, useEffect, useRef, useCallback } from 'react';
import loadable from '@loadable/component';
import { Image } from 'semantic-ui-react';
import { UniversalLink, Logo, Icon } from '@plone/volto/components';
import { getScaleUrl, getPath } from '@package/utils';
import { useWindowDimensions, useIntersection } from '@package/helpers';
import logoImage from '../../../icons/vanabbe.svg';

import './style.less';

const ReactYoutubePlayer = loadable(() => import('react-player/youtube'));
const ReactVimeoPlayer = loadable(() => import('react-player/vimeo'));

const getPosition = (ref) => {
  if (!ref.current) return;
  const position = ref.current.getBoundingClientRect().top;
  return position;
};

const VideoPlayer = (props) => {
  const { playing, videoUrl, setActive } = props;
  const vimeoURL = videoUrl?.match('vimeo');
  const youtubeURL = videoUrl?.match(/youtube|.be\//);

  const playerProps = {
    muted: true,
    playing: playing,
    controls: false,
    url: videoUrl,
    width: '100%',
    height: '100%',
  };

  return (
    <>
      {vimeoURL ? (
        <ReactVimeoPlayer {...playerProps} onPlay={() => setActive(true)} />
      ) : youtubeURL ? (
        <ReactYoutubePlayer {...playerProps} onPlay={() => setActive(true)} />
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

  const logoRef = useRef();
  const heroRef = useRef();
  const { windowHeight } = useWindowDimensions();
  const inViewport = useIntersection(heroRef, {
    threshold: 1.0,
    rootMargin: '0px',
  });

  const [isActive, setActive] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [scrollBottom, setScrollBottom] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [top, setTop] = useState();

  useEffect(() => {
    const loginHeight = document.getElementById('login').clientHeight;
    const logoHeight = document.getElementById('logo').clientHeight;
    const bottom = loginHeight + logoHeight;

    function onScroll() {
      let currentPosition = window.pageYOffset;
      if (currentPosition > scrollBottom) {
        setScrolling(true);
        setTop(windowHeight - bottom);
      } else {
        setScrolling(false);
      }
      setScrollBottom(currentPosition <= 0 ? 0 : currentPosition);
    }

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollBottom, windowHeight]);

  const setPosition = useCallback(() => {
    const position = getPosition(logoRef);
    setTop(position);
  }, []);

  useEffect(() => {
    if (!isView && scrolling) {
      setPlaying(true);
      setActive(true);
    }
  }, [scrolling, isView]);

  useEffect(() => {
    const position = getPosition(logoRef);
    if (!scrolling && inViewport) {
      setTop(position + window.scrollY);
    }
  }, [scrolling, inViewport]);

  useEffect(() => {
    setPosition();

    if (isActive) {
      const position = getPosition(logoRef);
      setTop(position + 230);
    }
  }, [isActive, setPosition]);

  useEffect(() => {
    window.addEventListener('resize', setPosition);
    return () => window.addEventListener('resize', setPosition);
  }, [setPosition]);

  return (
    <div className={`hero-unit-block ${isActive ? 'big-hero' : 'normal-hero'}`}>
      <div>
        <HeadlineTag className="hero-unit-title">{headline}</HeadlineTag>
        <div className="hero-unit-wrapper" ref={heroRef}>
          <div className={`hero-unit-image-wrapper ${videoUrl ? 'video' : ''}`}>
            {videoUrl && (
              <VideoPlayer
                playing={playing}
                videoUrl={videoUrl}
                setActive={setActive}
              />
            )}

            {attachedimage && (
              <Image
                className="hero-unit-image"
                onClick={() => setActive(true)}
                src={getScaleUrl(getPath(attachedimage), 'large')}
              />
            )}

            {buttonText && (
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
            <div className="hidden" ref={logoRef}>
              <Logo />
            </div>
            <div className="visible">
              <div id="logo" className="logo">
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
