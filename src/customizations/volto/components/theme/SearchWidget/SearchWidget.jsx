import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button } from 'semantic-ui-react';
import { Icon } from '@plone/volto/components';

import PopupMenu from '@package/components/theme/Navigation/PopupMenu';
import SearchWidget from '@package/components/theme/SearchWidget/SearchWidget';

import { useLocation } from 'react-router-dom';

import zoomSVG from '@plone/volto/icons/zoom.svg';
import closeSVG from '@plone/volto/icons/clear.svg';

const messages = defineMessages({
  search: {
    id: 'Search',
    defaultMessage: 'Search',
  },
  searchSite: {
    id: 'Search',
    defaultMessage: 'Search',
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

  const { children } = props;
  return (
    <div id="global-search-widget">
      <Button
        aria-label={intl.formatMessage(messages.search)}
        onClick={() => setShowPopup(true)}
      >
        <Icon name={zoomSVG} size="24px" />
      </Button>
      <PopupMenu open={showPopup} onClose={() => setShowPopup(false)}>
        <div className="hover-menu search-widget">
          <div className="hover-menu-inner">{children}</div>
          <div className="close-search">
            <Icon
              className="close-popup"
              onClick={() => setShowPopup(false)}
              name={closeSVG}
              size="35px"
            />
          </div>
        </div>
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
