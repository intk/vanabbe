import React, { useState, useEffect } from 'react';
import { Logo } from '@plone/volto/components';
import { UniversalLink } from '@plone/volto/components';
import loadable from '@loadable/component';
import './style.less';

const ReactYoutubePlayer = loadable(() => import('react-player/youtube'));
const ReactVimeoPlayer = loadable(() => import('react-player/vimeo'));

const VideoPlayer = (props) => {
  const { playing, videoUrl } = props;

  const playerProps = {
    muted: true,
    controls: true,
    playing: playing,
    url: videoUrl,
    width: '100%',
    height: '100%',
  };

  return (
    <>
      {videoUrl.match('vimeo') ? (
        <ReactVimeoPlayer {...playerProps} />
      ) : (
        <ReactYoutubePlayer {...playerProps} />
      )}
    </>
  );
};

const HeroUnitView = (props) => {
  const { data = {}, mode = 'view' } = props;
  const { headline, buttonText, headlineTag, videoUrl, linkHref } = data;
  const HeadlineTag = headlineTag || 'h2';
  const isView = mode === 'edit';
  const href = linkHref?.[0]?.['@id'] || '';

  const [isActive, setActive] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [scrollBottom, setScrollTop] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    function onScroll() {
      let currentPosition = window.pageYOffset;
      if (currentPosition > scrollBottom) {
        setScrolling(true);
      }
      setScrollTop(currentPosition <= 0 ? 0 : currentPosition);
    }

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollBottom]);

  useEffect(() => {
    if (!isView && scrolling) {
      setPlaying(true);
      setActive(true);
    }
  }, [scrolling, isView]);

  return (
    <div
      className={
        isActive ? 'hero-unit-block big-hero' : ' hero-unit-block normal-hero'
      }
    >
      <div>
        <HeadlineTag className="hero-unit-title">{headline}</HeadlineTag>
        <div className="hero-unit-wrapper">
          <div className="hero-unit-image-wrapper">
            <VideoPlayer playing={playing} videoUrl={videoUrl} />

            {buttonText && (
              <UniversalLink href={href} className="hero-unit-content">
                {buttonText}
              </UniversalLink>
            )}
          </div>

          <div className="hero-logo-wrapper">
            <div className="hidden">
              <Logo />
            </div>
            <div className="visible">
              <Logo hasLink={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroUnitView;
