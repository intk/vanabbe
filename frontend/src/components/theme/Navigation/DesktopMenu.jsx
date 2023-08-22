import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { NavLink, Link } from 'react-router-dom';
import { List } from 'semantic-ui-react';

import config from '@plone/volto/registry';

const HOME = ['', '/', '/en', '/nl'];

const DesktopMenu = (props) => {
  const { items, lang, token } = props;
  const { settings } = config;

  return (
    <List className="main-menu computer large screen widescreen only">
      {items
        .filter((item) => HOME.indexOf(item.url) === -1)
        .map((item, i) => {
          return item.items && item.items.length ? (
            <List.Item className="firstLevel" key={i}>
              <List.Content>
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
                <List.List>
                  {item.items.map((subitem, y) => {
                    return (
                      <List.Item key={y} className="secondLevel">
                        <List.Content>
                          <Link to={subitem.url === '' ? '/' : subitem.url}>
                            {subitem.title}
                          </Link>
                          {/* {subitem.items && subitem.items.length > 0 && (
                            <List.List>
                              {subitem.items.map((subsubitem, z) => {
                                return (
                                  <List.Item className="thirdLevel" key={z}>
                                    <Link
                                      to={
                                        subsubitem.url === ''
                                          ? '/'
                                          : subsubitem.url
                                      }
                                    >
                                      {subsubitem.title}
                                    </Link>
                                  </List.Item>
                                );
                              })}
                            </List.List>
                          )} */}
                        </List.Content>
                      </List.Item>
                    );
                  })}
                </List.List>
              </List.Content>
            </List.Item>
          ) : (
            <div className="ui item simple firstLevel" key={i}>
              {token ? (
                <Link to={item.url === '' ? '/' : item.url} key={item.url}>
                  {item.title}
                </Link>
              ) : (
                <> {item.title}</>
              )}
            </div>
          );
        })}
    </List>
  );
};

export default compose(
  connect((state) => ({
    token: state.userSession.token,
  })),
)(DesktopMenu);
