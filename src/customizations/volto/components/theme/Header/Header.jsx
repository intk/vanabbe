// Customized to use the HeroSection

import React from 'react';
import { InView } from 'react-intersection-observer';
import { useSelector } from 'react-redux';
import {
  LanguageSelector,
  Logo,
  Navigation,
  SearchWidget,
} from '@plone/volto/components';
import { Container } from 'semantic-ui-react';
import { BodyClass, isCmsUi } from '@plone/volto/helpers';
import { HeroSection } from '@package/components'; // , StickyHeader
import cx from 'classnames';
import usePreviewImage from './usePreviewImage';
import { useLocation } from 'react-router-dom';

const Header = (props) => {
  const { navigationItems } = props;
  const { pathname } = useLocation();

  const content = useSelector((state) => state.content.data);

  const previewImage = usePreviewImage(pathname);

  const previewImageUrl = previewImage?.scales?.huge?.download;
  // const contentImageCaption = content?.image_caption;

  const contentType = content?.['@type'];
  const isHomePage = contentType === 'Plone Site' || contentType === 'LRF';
  const cmsView = isCmsUi(pathname);
  const homePageView = isHomePage && !cmsView;
  const [inView, setInView] = React.useState();

  return (
    <Container>
      <div
        className={cx('portal-top', homePageView ? 'homepage' : 'contentpage')}
      >
        {homePageView && <BodyClass className="homepage-view" />}
        {!cmsView && <BodyClass className="has-image" />}
        <div className={`${homePageView ? 'home-nav' : 'page-nav'}`}>
          <Logo />
        </div>
        <div
          className={cx(
            'header-wrapper',
            homePageView ? 'homepage' : 'contentpage',
            inView ? 'header-in-view' : 'header-out-of-view fadeInDown',
          )}
          role="banner"
        >
          <div className="header">
            <div className="left-section">
              <div className="header-tools">
                <LanguageSelector />
              </div>
            </div>
            <div className="right-section">
              <SearchWidget pathname={pathname} />
              <Navigation pathname={pathname} navigation={navigationItems} />
            </div>
          </div>
        </div>
        <InView
          as="div"
          className="header-visibility-sensor"
          onChange={(inView, entry) => setInView(inView)}
        >
          {' '}
        </InView>

        {!(cmsView || isHomePage) && (
          <div className="header-bg">
            <div className="header-container">
              <HeroSection image_url={previewImageUrl} content={content} />
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Header;
