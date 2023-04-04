import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image } from 'semantic-ui-react';
import { UniversalLink, Logo, Icon } from '@plone/volto/components';
import { getScaleUrl, getPath } from '@package/utils';
import { useWindowDimensions } from '@package/helpers';
import logoImage from '../../../icons/vanabbe.svg';
import VideoPlayer from './VideoPlayer';
import cx from 'classnames';

import './style.less';

// spacebar: 32, pagedown: 34, end: 35,  arrow down: 40
const KEYS = { 32: 1, 34: 1, 35: 1, 40: 1 };
const animationDuration = 1500;

const getPosition = (ref) => {
  if (!ref.current) return;
  const position = ref.current.getBoundingClientRect().top;
  return position;
};

const HeroUnitView = (props) => {
  const { windowHeight, windowWidth } = useWindowDimensions();
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

  const [isActive, setIsActive] = useState(false);
  const [scrollDown, setScrollDown] = useState(null);
  const [bottom, setBottom] = useState(0);
  const [logoTopPosition, setLogoTopPosition] = useState();
  const [isTopOfPage, setIsTopOfPage] = useState(true);
  const [scrollCount, setScrollCount] = useState(0);

  const setLogoPosition = useCallback(() => {
    const position = getPosition(logoRef);
    setLogoTopPosition(position);
  }, []);

  useEffect(() => {
    if (isTopOfPage) {
      setLogoTopPosition('auto');
      setIsActive(false);
    }
  }, [isTopOfPage]);

  useEffect(() => {
    if (isActive && isTopOfPage) {
      let timer = setTimeout(function () {
        setLogoTopPosition(getPosition(logoRef));
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [isActive, isTopOfPage]);

  useEffect(() => {
    const handleScroll = () => {
      let currentPosition = window.pageYOffset;

      if (currentPosition > bottom) {
        setScrollDown(true);
      } else {
        setScrollDown(false);
      }

      if (currentPosition === 0) {
        setLogoTopPosition('auto');
        setScrollCount(0);
        setIsTopOfPage(true);
      } else {
        setIsTopOfPage(false);
      }

      setBottom(currentPosition <= 0 ? 0 : currentPosition);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bottom]);

  useEffect(() => {
    const handleScroll = (e) => {
      const scrollDown = e.wheelDelta < 0 ? true : false;
      if (scrollCount > 0) {
        return;
      }
      if (scrollDown || KEYS[e.keyCode]) {
        setIsActive(true);
        if (isActive) {
          setTimeout(() => {
            setScrollCount(scrollCount + 1);
          }, animationDuration);
        }
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleScroll, false);
    window.addEventListener('mousewheel', handleScroll, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleScroll, false);
      window.removeEventListener('mousewheel', handleScroll, {
        passive: false,
      });
    };
  }, [scrollCount, isActive]);

  useEffect(() => {
    const loginHeight = document.getElementById('login').clientHeight;
    // 100px is the logo height when the logo animation ends
    const height = windowWidth > 791 ? 100 : 44;
    const logoBottomPosition = loginHeight + height;

    if (scrollDown) {
      setIsActive(true);
      setLogoTopPosition(windowHeight - logoBottomPosition);
    }

    if (!isTopOfPage && !scrollDown) {
      setLogoTopPosition(windowHeight - logoBottomPosition);
    }
  }, [isTopOfPage, scrollDown, windowHeight, windowWidth]);

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
        <div className="hero-unit-wrapper">
          <div
            className={cx('hero-unit-image-wrapper', {
              video: videoUrl,
            })}
          >
            {videoUrl && <VideoPlayer videoUrl={videoUrl} />}

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
                <Icon
                  name={logoImage}
                  style={isView ? { top: logoTopPosition } : { top: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroUnitView;
