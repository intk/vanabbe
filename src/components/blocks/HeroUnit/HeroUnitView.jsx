import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image } from 'semantic-ui-react';
import { UniversalLink, Logo, Icon } from '@plone/volto/components';
import { getScaleUrl, getPath } from '@package/utils';
import { useWindowDimensions } from '@package/helpers';
import logoImage from '../../../icons/vanabbe.svg';
import VideoPlayer from './VideoPlayer';
import cx from 'classnames';

import './style.less';

// left: 37, up: 38, right: 39, down: 40,
const KEYS = { 40: 1 };

const getPosition = (ref) => {
  if (!ref.current) return;
  const position = ref.current.getBoundingClientRect().top;
  return position;
};

const HeroUnitView = (props) => {
  const { windowHeight } = useWindowDimensions();
  const { data = {}, mode = 'view' } = props;
  const {
    headline,
    buttonTitle,
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

  const [playing, setPlaying] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [scrollDown, setScrollDown] = useState(null);
  const [bottom, setBottom] = useState(0);
  const [top, setTop] = useState();
  const [isTopOfPage, setIsTopOfPage] = useState(true);
  const [scrollCount, setScrollCount] = useState(0);

  const setLogoPosition = useCallback(() => {
    const position = getPosition(logoRef);
    setTop(position);
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

    const handleScroll = () => {
      let currentPosition = window.pageYOffset;
      if (currentPosition > bottom) {
        setScrollDown(true);
      } else {
        setScrollDown(false);
      }

      if (currentPosition === 0) {
        setScrollCount(0);
        setTop('auto');
        setIsTopOfPage(true);
      } else {
        setIsTopOfPage(false);
      }

      setBottom(currentPosition <= 0 ? 0 : currentPosition);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bottom, isView]);

  useEffect(() => {
    if (!isView) {
      return;
    }

    const handleScroll = (e) => {
      const scrollDown = e.wheelDelta < 0 ? true : false;
      if (scrollCount === 0 && (scrollDown || KEYS[e.keyCode])) {
        setIsActive(true);

        if (isActive) {
          setScrollCount(scrollCount + 1);
        }
        e.preventDefault();
      }
    };

    window.addEventListener('mousewheel', handleScroll, {
      passive: false,
    });
    window.addEventListener('keydown', handleScroll);
    window.addEventListener('touchmove', handleScroll, { passive: false });

    return () => {
      window.removeEventListener('mousewheel', handleScroll, {
        passive: false,
      });
      window.removeEventListener('keydown', handleScroll);
      window.removeEventListener('touchmove', handleScroll, { passive: false });
    };
  }, [scrollCount, isActive, isView]);

  useEffect(() => {
    if (!isView) {
      return;
    }

    if (!scrollDown) {
      setIsActive(false);
    }
  }, [scrollDown, isView]);

  useEffect(() => {
    const loginHeight = document.getElementById('login').clientHeight;
    const logoHeight = document.getElementById('logo').clientHeight;
    const logoBottomPosition = loginHeight + logoHeight;

    if (scrollDown) {
      setTop(windowHeight - logoBottomPosition);
    }
  }, [scrollDown, windowHeight]);

  useEffect(() => {
    if (isActive) {
    }
  }, [isActive, scrollCount]);

  useEffect(() => {
    window.addEventListener('resize', setLogoPosition);
    return () => window.addEventListener('resize', setLogoPosition);
  }, [setLogoPosition]);

  return (
    <div
      className={cx('hero-unit-block', {
        active: isActive,
        'on-top': isTopOfPage,
        'scroll-down': scrollDown,
        'scroll-up': scrollDown === false,
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

            {buttonTitle && (
              <UniversalLink href={href} className="hero-unit-content">
                {buttonTitle}
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
