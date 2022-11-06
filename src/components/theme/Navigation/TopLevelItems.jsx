import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@plone/volto/components';
import config from '@plone/volto/registry';
import { Menu, Dropdown } from 'semantic-ui-react';

// import DesktopNavItems from './DesktopNavItems';
// import PopupMenu from './PopupMenu';

import { Link } from 'react-router-dom';
// import cx from 'classnames';

import downKeySVG from '@plone/volto/icons/down-key.svg';
import rightKeySVG from '@plone/volto/icons/right-key.svg';

const HOME = ['', '/', '/en', '/nl'];

export default function TopLevelItems(props) {
  const { items, lang, closeMobileMenu } = props;
  const { settings } = config;

  // const handleClick = (item) => (e) => {
  //   setTopItem(item);
  //   e.preventDefault();
  //   e.stopPropagation();
  // };

  // const [topItem, setTopItem] = React.useState();

  return (
    <Menu
      stackable
      pointing
      secondary
      className="computer large screen widescreen only"
      onClick={closeMobileMenu}
    >
      {items
        .filter((item) => HOME.indexOf(item.url) === -1)
        .map((item, i) => {
          return item.items && item.items.length ? (
            <Dropdown
              item
              simple
              className="firstLevel"
              key={i}
              trigger={
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
                  <Icon name={downKeySVG} size="24px" />
                </NavLink>
              }
            >
              <Menu vertical>
                {item.items.map((subitem, y) => {
                  return (
                    <Dropdown
                      key={y}
                      className="secondLevel"
                      simple
                      // pointing="left"
                      item
                      trigger={
                        <Link to={subitem.url === '' ? '/' : subitem.url}>
                          {subitem.title}
                          {subitem.items.length > 0 && (
                            <Icon name={rightKeySVG} size="23px" />
                          )}
                        </Link>
                      }
                    >
                      <Dropdown.Menu>
                        {subitem.items.map((subsubitem, z) => {
                          return (
                            <Dropdown.Item className="thirdLevel" key={z}>
                              <Link
                                to={
                                  subsubitem.url === '' ? '/' : subsubitem.url
                                }
                              >
                                {subsubitem.title}
                              </Link>
                            </Dropdown.Item>
                          );
                        })}
                      </Dropdown.Menu>
                    </Dropdown>
                  );
                })}
              </Menu>
            </Dropdown>
          ) : (
            <div className="ui item simple dropdown firstLevel" key={i}>
              <Link
                to={item.url === '' ? '/' : item.url}
                key={item.url}
                // className="item"
              >
                {item.title}
              </Link>
            </div>
          );
        })}

      {/* {items
        .filter((item) => HOME.indexOf(item.url) === -1)
        .map((item) => (
          <NavLink
            to={item.url === '' ? '/' : item.url}
            key={item.url}
            activeClassName="active"
            className="item"
            exact={
              settings.isMultilingual
                ? item.url === `/${lang}`
                : item.url === ''
            }
            onClick={handleClick(item)}
            onKeyDown={handleClick(item)}
          >
            {item.title}
            <Icon name={downKeySVG} size="24px" />
          </NavLink>
        ))} */}

      {/* <PopupMenu open={!!topItem} onClose={() => setTopItem(null)}>
        <div className="hover-menu">
          <div tabIndex="-1" role="button" className="hover-menu-inner">
            <div className="">
              {!!topItem && (
                <DesktopNavItems
                  items={topItem.items || []}
                  lang={props.lang}
                  onClose={() => setTopItem(null)}
                />
              )}
            </div>
          </div>
        </div>
      </PopupMenu> */}
    </Menu>
  );
}
