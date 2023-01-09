import React from 'react';
import { Image } from 'semantic-ui-react';
import { Placeholder } from 'semantic-ui-react';
import { Logo } from '@plone/volto/components';
import { getScaleUrl, getPath } from '@package/utils';

import './style.less';

const HeroUnitView = (props) => {
  const { title, headlineTag, attachedimage } = props.data;
  const HeadlineTag = headlineTag || 'h2';

  const [isActive, setActive] = React.useState(false);

  const toggleClass = () => {
    setActive(!isActive);
  };

  return (
    <div className={isActive ? 'big-hero' : 'normal-hero'}>
      <div className="hero-unit-block">
        <HeadlineTag className="hero-unit-title">{title}</HeadlineTag>
        <div className="hero-unit-wrapper">
          {attachedimage ? (
            <Image
              style={{ height: `${isActive ? '500px' : '380px'}` }}
              className="hero-unit-image"
              onClick={toggleClass}
              src={getScaleUrl(getPath(attachedimage), 'large')}
            />
          ) : (
            <Placeholder />
          )}
          <Logo height={isActive ? '100px' : '220px'} />
        </div>
      </div>
    </div>
  );
};

export default HeroUnitView;
