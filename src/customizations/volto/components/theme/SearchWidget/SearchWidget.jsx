import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button, Container } from 'semantic-ui-react';
import { BodyClass } from '@plone/volto/helpers';
import PopupMenu from '@package/components/theme/Navigation/PopupMenu';
import SearchWidget from '@package/components/theme/SearchWidget/SearchWidget';
import { Logo } from '@plone/volto/components';

import { useLocation } from 'react-router-dom';

const messages = defineMessages({
  search: {
    id: 'Search',
    defaultMessage: 'Search',
  },
  close: {
    id: 'Close',
    defaultMessage: 'Close',
  },
});

const SearchWidgetWrapper = (props) => {
  const intl = useIntl();
  const [showPopup, setShowPopup] = React.useState();
  const location = useLocation();

  React.useEffect(() => {
    setShowPopup(false);
  }, [location]);

  React.useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        setShowPopup(false);
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  function handleClick(e) {
    setShowPopup((showPopup) => !showPopup);
  }

  const { children } = props;
  return (
    <div id="global-search-widget">
      {showPopup && <BodyClass className="open-search open-popup" />}
      <Button
        basic
        className="nav-button"
        aria-label={intl.formatMessage(messages.search)}
        onClick={handleClick}
      >
        {showPopup ? (
          <>{intl.formatMessage(messages.close)}</>
        ) : (
          <>{intl.formatMessage(messages.search)}</>
        )}
      </Button>
      <PopupMenu open={showPopup}>
        <Container>
          <div className="search popup-inner popup-menu-inner">
            <div className="popup-bottom">
              {children}
              <Logo height="100px" hasLink />
            </div>
          </div>
        </Container>
      </PopupMenu>
    </div>
  );
};

const GlobalSearchWidget = (props) => (
  <SearchWidgetWrapper>
    <SearchWidget {...props} />
  </SearchWidgetWrapper>
);

export default GlobalSearchWidget;
