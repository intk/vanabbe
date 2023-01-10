import React from 'react';
import { Image } from 'semantic-ui-react';
import { Placeholder } from 'semantic-ui-react';
import { Logo } from '@plone/volto/components';
import { getScaleUrl, getPath } from '@package/utils';
import { UniversalLink } from '@plone/volto/components';
import './style.less';

const HeroUnitView = (props) => {
  const {
    headline,
    buttonText,
    headlineTag,
    attachedimage,
    linkHref,
  } = props.data;
  const HeadlineTag = headlineTag || 'h2';
  let href = linkHref?.[0]?.['@id'] || '';
  const [isActive, setActive] = React.useState(false);

  const toggleClass = () => {
    setActive(!isActive);
  };

  return (
    <div
      className={
        isActive ? 'hero-unit-block big-hero' : ' hero-unit-block normal-hero'
      }
    >
      <div>
        <HeadlineTag className="hero-unit-title">{headline}</HeadlineTag>
        <div className="hero-unit-wrapper">
          <div className="hero-unit-image-wrapper">
            {attachedimage ? (
              <Image
                className="hero-unit-image"
                onClick={toggleClass}
                src={getScaleUrl(getPath(attachedimage), 'large')}
              />
            ) : (
              <Placeholder />
            )}
            {buttonText && (
              <UniversalLink href={href} className="hero-unit-content">
                {buttonText}
              </UniversalLink>
            )}
          </div>

          <div className="hero-logo-wrapper">
            <div className="hidden">
              <Logo />
            </div>
            <div className="visible">
              <Logo hasLink={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroUnitView;
