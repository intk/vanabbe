// Customized to use the HeroSection

import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
  LanguageSelector,
  Logo,
  Navigation,
  SearchWidget,
} from '@plone/volto/components';
import { Container, Grid } from 'semantic-ui-react';
import { BodyClass, isCmsUi } from '@plone/volto/helpers';
import {
  HeroSection,
  ContrastToggle,
  OpeningHours,
  HeaderButton,
} from '@package/components';
import { usePreviewImage } from '@package/helpers';

const Header = (props) => {
  const { navigationItems } = props;
  const { pathname } = useLocation();
  const content = useSelector((state) => state.content.data);
  const { title, description, objectTitle } = content || {};
  const previewImage = usePreviewImage(pathname);
  const previewImageUrl = previewImage?.scales?.huge?.download;
  const contentType = content?.['@type'];
  const isHomePage = contentType === 'Plone Site' || contentType === 'LRF';
  const cmsView = isCmsUi(pathname);
  const homePageView = isHomePage && !cmsView;

  return (
    <>
      <div className="portal-top">
        <Container>
          {homePageView && <BodyClass className="homepage-view" />}
          {!cmsView && <BodyClass className="has-image" />}

          <div className="logo-wrapper">
            <div className="fixed-logo">
              <Logo height="98px" hasLink />
            </div>
          </div>

          <div className="header-wrapper">
            <div className="header">
              <div className="header-section">
                <div className="left-section">
                  <div className="header-tools">
                    <HeaderButton />
                    <div className="computer large screen widescreen only">
                      <OpeningHours />
                    </div>
                    <div className="computer large screen widescreen only">
                      <ContrastToggle />
                      <LanguageSelector />
                    </div>
                  </div>
                </div>
                <div className="right-section">
                  <SearchWidget pathname={pathname} />
                  <Navigation
                    pathname={pathname}
                    navigation={navigationItems}
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {!(cmsView || isHomePage) && (
        <>
          <Container className="sticky-heading">
            <div id="heading" className="offset-1-left offset-2-right">
              {title && (
                <h1 className="content-title">{objectTitle || title}</h1>
              )}
              {description && (
                <p className="content-description">{description}</p>
              )}
            </div>
          </Container>
          <Container>
            <div className="offset-1-right">
              <div className="header-bg">
                <div className="header-container">
                  <HeroSection image_url={previewImageUrl} content={content} />
                </div>
              </div>
            </div>
          </Container>
        </>
      )}
    </>
  );
};

export default Header;
