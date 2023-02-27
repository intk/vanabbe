import React, { useState, useEffect, useRef, useCallback } from 'react';
import loadable from '@loadable/component';
import { Image } from 'semantic-ui-react';
import { UniversalLink, Logo, Icon } from '@plone/volto/components';
import { getScaleUrl, getPath } from '@package/utils';
import { useWindowDimensions, useIntersection } from '@package/helpers';
import logoImage from '../../../icons/vanabbe.svg';
import cx from 'classnames';
import './style.less';

const ReactYoutubePlayer = loadable(() => import('react-player/youtube'));
const ReactVimeoPlayer = loadable(() => import('react-player/vimeo'));

const getPosition = (ref) => {
  if (!ref.current) return;
  const position = ref.current.getBoundingClientRect().top;
  return position;
};

const VideoPlayer = (props) => {
  const { playing, videoUrl, setIsActive } = props;
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
        <ReactVimeoPlayer {...playerProps} onPlay={() => setIsActive(true)} />
      ) : youtubeURL ? (
        <ReactYoutubePlayer {...playerProps} onPlay={() => setIsActive(true)} />
      ) : null}
    </>
  );
};

const HeroUnitView = (props) => {
  const { windowHeight } = useWindowDimensions();
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
  const isView = mode !== 'edit';
  const href = linkHref?.[0]?.['@id'] || '';

  const logoRef = useRef();
  const heroRef = useRef();
  const inViewportBlock = useIntersection(heroRef, {
    threshold: 0,
    rootMargin: '0px',
  });

  const [playing, setPlaying] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [scrollDown, setScrollDown] = useState(null);
  const [bottom, setBottom] = useState(0);
  const [top, setTop] = useState();
  const [logoSize, setLogoSize] = useState('');
  const [isTopOfPage, setIsTopOfPage] = useState(true);
  const [initialPosition, setInitialPosition] = useState('');

  const setLogoPosition = useCallback(() => {
    const position = getPosition(logoRef);
    setTop(position);
  }, []);

  useEffect(() => {
    const loginHeight = document.getElementById('login').clientHeight;
    const logoHeight = document.getElementById('logo').clientHeight;
    const bottomLogo = loginHeight + logoHeight;

    const handleScroll = () => {
      let currentPosition = window.pageYOffset;
      if (currentPosition > bottom) {
        setScrollDown(true);
        setTop(windowHeight - bottomLogo);
      } else {
        setScrollDown(false);
      }

      if (currentPosition === 0) {
        setIsTopOfPage(true);
        setTop(initialPosition);
      } else {
        setIsTopOfPage(false);
      }

      setBottom(currentPosition <= 0 ? 0 : currentPosition);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bottom, inViewportBlock, initialPosition, windowHeight]);

  useEffect(() => {
    const position = getPosition(logoRef);
    if (window.scrollY > 0) {
      setInitialPosition(position + window.scrollY);
    } else {
      setInitialPosition(position);
    }
  }, []);

  useEffect(() => {
    if (!isView) {
      return;
    }
    setPlaying(true);
  }, [isView]);

  useEffect(() => {
    if (!isView) {
      return;
    }
    scrollDown ? setIsActive(true) : setIsActive(false);
  }, [scrollDown, isView]);

  useEffect(() => {
    if (!isView) {
      return;
    }

    if (isTopOfPage) {
      setLogoSize('big');
    } else {
      setLogoSize('small');
    }
  }, [isView, scrollDown, isTopOfPage]);

  useEffect(() => {
    window.addEventListener('resize', setLogoPosition);
    return () => window.addEventListener('resize', setLogoPosition);
  }, [setLogoPosition]);

  return (
    <div
      className={cx('hero-unit-block', {
        'big-hero': isActive,
        'normal-hero': !isActive,
        'big-logo': logoSize === 'big',
        'small-logo': logoSize === 'small',
        'scroll-in-view': scrollDown === false,
      })}
    >
      <div>
        <HeadlineTag className="hero-unit-title">{headline}</HeadlineTag>
        <div className="hero-unit-wrapper" ref={heroRef}>
          <div
            className={cx('hero-unit-image-wrapper', {
              video: videoUrl,
            })}
          >
            {videoUrl && <VideoPlayer playing={playing} videoUrl={videoUrl} />}

            {attachedimage && (
              <Image
                className="hero-unit-image"
                onClick={() => setIsActive(true)}
                src={getScaleUrl(getPath(attachedimage), 'large')}
              />
            )}

            {buttonText && (
              <UniversalLink href={href} className="hero-unit-content">
                {buttonText}
              </UniversalLink>
            )}
          </div>

          <div className="hero-logo-wrapper">
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
