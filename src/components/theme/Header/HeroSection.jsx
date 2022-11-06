import React from 'react';
import { Container } from 'semantic-ui-react';
import { Breadcrumbs } from '@plone/volto/components';
import { useLocation } from 'react-router-dom';
import { BodyClass } from '@plone/volto/helpers';

function HeroSection(props) {
  const { image_url, content } = props;
  const { title, preview_caption } = content || {};
  const location = useLocation();

  return (
    <Container>
      {title && <h1 className="content-title">{title}</h1>}
      <div className="herosection">
        <div className="herosection-content-wrapper">
          {image_url ? (
            <>
              <BodyClass className="has-hero-image" />
              <div
                className="herosection-content-image document-image"
                style={{
                  backgroundImage: `url(${image_url})`,
                }}
              />
            </>
          ) : (
            <div className="herosection-missing-image"></div>
          )}
        </div>
        <div className="caption content-wrapper">
          {preview_caption && (
            <p className="content-image-caption">{preview_caption}</p>
          )}
        </div>
      </div>
      <Breadcrumbs pathname={location.pathname} />
    </Container>
  );
}

export default HeroSection;
