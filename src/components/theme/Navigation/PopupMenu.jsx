import React from 'react';
import { Portal } from 'react-portal';
import { CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';

const DEFAULT_TIMEOUT = 500;

const PopupMenu = (props) => {
  const { children, open, onClose, className } = props;

  const asideElement = React.createRef();

  const handleClickOutside = (e) => {
    if (asideElement && doesNodeContainClick(asideElement.current, e)) return;
    onClose();
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside, false);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, false);
    };
  });

  const [isClient, setIsClient] = React.useState();

  React.useEffect(() => setIsClient(true), []);

  return (
    <CSSTransition
      in={open}
      timeout={DEFAULT_TIMEOUT}
      classNames="popup-menu"
      unmountOnExit
    >
      <Portal node={isClient && document && document.getElementById('#main')}>
        <div
          role="presentation"
          onClick={(e) => {
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          ref={asideElement}
          key="popupmenu"
          className={cx('popup-menu', className)}
          style={{ overflowY: 'auto' }}
        >
          {children}
        </div>
      </Portal>
    </CSSTransition>
  );
};

PopupMenu.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  overlay: PropTypes.bool,
};

PopupMenu.defaultProps = {
  open: false,
  onClose: () => {},
  overlay: false,
};

export default PopupMenu;
