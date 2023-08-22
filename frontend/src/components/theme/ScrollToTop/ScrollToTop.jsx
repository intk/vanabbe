import React, { useState, useEffect } from 'react';
import { Button, Icon } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  return (
    <>
      {isVisible && (
        <div className="scroll-to-top">
          <Button
            icon
            title={
              <FormattedMessage
                id="scroll_to_top"
                defaultMessage="Scroll to top"
              />
            }
            onClick={scrollToTop}
          >
            <Icon name="level up alternate" size="large" />
          </Button>
        </div>
      )}
    </>
  );
};

export default ScrollToTop;
