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
import { Container, Button, Grid } from 'semantic-ui-react';
import { BodyClass, isCmsUi } from '@plone/volto/helpers';
import { HeroSection, ContrastToggle } from '@package/components'; // , StickyHeader
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

        <div className="logo-wrapper fixed-logo full_width">
          <div className={`${homePageView ? 'home-logo' : 'page-logo'}`}>
            <Logo />
          </div>
        </div>

        <div
          className={cx(
            'header-wrapper',
            homePageView ? 'homepage' : 'contentpage',
            inView
              ? 'header-in-view'
              : 'header-out-of-view fadeInDown full_width',
          )}
          role="banner"
        >
          <div className="header">
            {/* <div className="left-section">
              <div className="header-tools">
                <Button primary>Tickets</Button>
                <div>
                  <div className="computer large screen widescreen only">
                    <ContrastToggle />
                    <LanguageSelector />
                  </div>
                </div>
              </div>
            </div>
            <div className="right-section">
              <SearchWidget pathname={pathname} />
              <Navigation pathname={pathname} navigation={navigationItems} />
            </div> */}
            <div className={`${inView ? '' : 'ui container'}`}>
              <Grid>
                <Grid.Row>
                  <Grid.Column computer={1} tablet={2} mobile={2}>
                    <Button primary>Tickets</Button>
                  </Grid.Column>
                  <Grid.Column only="computer large screen" width={2}>
                    <div>
                      <ContrastToggle />
                      <LanguageSelector />
                    </div>
                  </Grid.Column>
                  <Grid.Column computer={6} tablet={6} mobile={4}></Grid.Column>
                  <Grid.Column
                    computer={2}
                    tablet={2}
                    mobile={4}
                    style={{ textAlign: 'right' }}
                  >
                    <SearchWidget pathname={pathname} />
                  </Grid.Column>
                  <Grid.Column>
                    <Navigation
                      pathname={pathname}
                      navigation={navigationItems}
                    />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
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
