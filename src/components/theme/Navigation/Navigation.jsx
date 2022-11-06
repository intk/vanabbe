/**
 * Navigation components.
 * @module components/theme/Navigation/Navigation
 */

import { isMatch } from 'lodash';

import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
// import { getBaseUrl, hasApiExpander } from '@plone/volto/helpers';
// import config from '@plone/volto/registry';
import { getNavigation } from '@plone/volto/actions';
import { useLocation } from 'react-router-dom';

import TopLevelItems from './TopLevelItems';
import MobileNavItems from './MobileNavItems';

const messages = defineMessages({
  closeMobileMenu: {
    id: 'Close menu',
    defaultMessage: 'Close menu',
  },
  openMobileMenu: {
    id: 'Open menu',
    defaultMessage: 'Open menu',
  },
});

function isActive(url, pathname) {
  return (
    (url === '' && pathname === '/') ||
    (url !== '' && isMatch(pathname.split('/'), url.split('/')))
  );
}

// function LocalDimmer({ active }) {
//   return active ? (
//     <div className="ui dimmer" style={{ display: 'block' }}></div>
//   ) : null;
// }

function Navigation({ pathname, intl, items, lang }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState();
  const location = useLocation();

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // We don't want to trigger getNavigation from the Component
  // See https://github.com/plone/volto/pull/2751/files
  //
  // React.useEffect(() => {
  //   const { settings } = config;
  //   if (!hasApiExpander('navigation', getBaseUrl(pathname))) {
  //     getNavigation(getBaseUrl(pathname), settings.navDepth);
  //   }
  // }, [pathname]);

  return (
    <nav className="navigation" id="navigation" aria-label="navigation">
      {/* <LocalDimmer active={isMobileMenuOpen} /> */}
      <div className="hamburger-wrapper mobile tablet only">
        <button
          className={cx('hamburger hamburger--spin', {
            'is-active': isMobileMenuOpen,
          })}
          aria-label={
            isMobileMenuOpen
              ? intl.formatMessage(messages.closeMobileMenu)
              : intl.formatMessage(messages.openMobileMenu)
          }
          title={
            isMobileMenuOpen
              ? intl.formatMessage(messages.closeMobileMenu)
              : intl.formatMessage(messages.openMobileMenu)
          }
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="hamburger-box">
            <span className="hamburger-inner" />
          </span>
        </button>
      </div>

      <TopLevelItems
        items={items}
        lang={lang}
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      <MobileNavItems
        lang={lang}
        items={items}
        open={isMobileMenuOpen}
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
        isActive={isActive}
        pathname={pathname}
      />
    </nav>
  );
}

export default compose(
  injectIntl,
  connect(
    (state) => ({
      token: state.userSession.token,
      items: state.navigation.items,
      lang: state.intl.locale,
    }),
    { getNavigation },
  ),
)(Navigation);
