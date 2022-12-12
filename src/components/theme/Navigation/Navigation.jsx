/**
 * Navigation components.
 * @module components/theme/Navigation/Navigation
 */

import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { defineMessages, injectIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import { getNavigation } from '@plone/volto/actions';
import { BodyClass } from '@plone/volto/helpers';
import { Logo } from '@plone/volto/components';

import DesktopMenu from './DesktopMenu';
import MobileMenu from './MobileMenu';
import PopupMenu from './PopupMenu';

const messages = defineMessages({
  closeMobileMenu: {
    id: 'Close',
    defaultMessage: 'Close',
  },
  openMobileMenu: {
    id: 'Menu',
    defaultMessage: 'Menu',
  },
});

function Navigation({ pathname, intl, items, lang }) {
  const [isOpened, setIsOpened] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setIsOpened(false);
  }, [location]);

  function handleClick(e) {
    setIsOpened((isOpened) => !isOpened);
  }

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
      {isOpened && <BodyClass className="open-menu" />}

      <Button
        basic
        className="big-button"
        onClick={handleClick}
        aria-label={intl.formatMessage(messages.openMobileMenu)}
      >
        {isOpened ? (
          <>{intl.formatMessage(messages.closeMobileMenu)}</>
        ) : (
          <>{intl.formatMessage(messages.openMobileMenu)}</>
        )}
      </Button>

      <PopupMenu open={isOpened}>
        <div className="popup-inner popup-menu-inner">
          <DesktopMenu items={items} lang={lang} />
          <MobileMenu items={items} lang={lang} />
          <Logo />
        </div>
      </PopupMenu>
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
