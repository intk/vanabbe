import React from 'react';
import NavItem from './NavItem';

const NavItems = ({ items, lang, onClose }) => {
  return (
    <div className="hover-menu-items">
      {items.map((item) => (
        <NavItem item={item} lang={lang} key={item.url} onClose={onClose} />
      ))}
    </div>
  );
};

export default NavItems;
