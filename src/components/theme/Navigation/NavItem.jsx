import React from 'react';
import { NavLink } from 'react-router-dom';
import { isInternalURL } from '@plone/volto/helpers';
import config from '@plone/volto/registry';
import cx from 'classnames';

const NavItem = ({ item, lang, onClose, level = 0 }) => {
  const { settings } = config;
  // The item.url in the root is ''
  // TODO: make more consistent it everywhere (eg. reducers to return '/' instead of '')
  if (isInternalURL(item.url) || item.url === '') {
    return (
      <div className={cx('item', `level-${level}`)}>
        <NavLink
          to={item.url === '' ? '/' : item.url}
          key={item.url}
          activeClassName="active"
          exact={
            settings.isMultilingual ? item.url === `/${lang}` : item.url === ''
          }
          onClick={onClose}
        >
          {item.title}
        </NavLink>
        {item.items?.map((child) => (
          <NavItem
            item={child}
            lang={lang}
            level={level + 1}
            key={child.url}
            onClose={onClose}
          />
        ))}
      </div>
    );
  } else {
    return (
      <>
        <a
          href={item.url}
          key={item.url}
          className="item"
          rel="noopener noreferrer"
          level={level}
        >
          {item.title}
        </a>
        {item.items?.map((child) => (
          <NavItem item={child} lang={lang} level={level + 1} key={child.url} />
        ))}
      </>
    );
  }
};

export default NavItem;
