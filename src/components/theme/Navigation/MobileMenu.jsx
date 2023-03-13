import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { NavLink, Link } from 'react-router-dom';
import { Menu, Dropdown } from 'semantic-ui-react';
import { Icon } from '@plone/volto/components';
import config from '@plone/volto/registry';

import downKeySVG from '@plone/volto/icons/down-key.svg';
import upKeySVG from '@plone/volto/icons/up-key.svg';

const HOME = ['', '/', '/en', '/nl'];

const MenuItem = (props) => {
  const { item, lang, token } = props;
  const [isOpened, setIsOpened] = React.useState(false);

  const { settings } = config;

  return item ? (
    <Dropdown
      item
      className="firstLevel"
      onClick={() => setIsOpened(!isOpened)}
      open={isOpened}
      trigger={
        <div className="item-wrapper">
          {token ? (
            <NavLink
              to={item.url === '' ? '/' : item.url}
              activeClassName="active"
              exact={
                settings.isMultilingual
                  ? item.url === `/${lang}`
                  : item.url === ''
              }
            >
              {item.title}
            </NavLink>
          ) : (
            <>{item.title}</>
          )}

          {isOpened ? (
            <Icon name={upKeySVG} size="40px" />
          ) : (
            <Icon name={downKeySVG} size="40px" />
          )}
        </div>
      }
    >
      <Dropdown.Menu>
        {item.items.map((subitem, y) => {
          return (
            <Dropdown
              key={y}
              className="secondLevel"
              simple
              item
              trigger={
                <Link to={subitem.url === '' ? '/' : subitem.url}>
                  {subitem.title}
                </Link>
              }
            ></Dropdown>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  ) : (
    <div className="ui item simple dropdown firstLevel">
      {token ? (
        <Link to={item.url === '' ? '/' : item.url} key={item.url}>
          {item.title}
        </Link>
      ) : (
        <>{item.title}</>
      )}
    </div>
  );
};

const MobileMenu = (props) => {
  const { items } = props;

  return (
    <Menu
      stackable
      pointing
      secondary
      className="mobile tablet only mobile-popup-menu full_width"
    >
      {items
        .filter((item) => HOME.indexOf(item.url) === -1)
        .map((item, i) => {
          return <MenuItem key={i} item={item} {...props} />;
        })}
    </Menu>
  );
};

export default compose(
  connect((state) => ({
    token: state.userSession.token,
  })),
)(MobileMenu);
