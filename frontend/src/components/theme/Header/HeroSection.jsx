import React from 'react';
import { BodyClass } from '@plone/volto/helpers';
// import { Breadcrumbs } from '@plone/volto/components';
// import { useLocation } from 'react-router-dom';

function HeroSection(props) {
  const { image_url, content } = props;
  const { preview_caption, hide_header_image } = content || {};
  // const location = useLocation();

  return (
    <div className="herosection-wrapper">
      {/* <Breadcrumbs pathname={location.pathname} /> */}

      <div className="herosection">
        <div className="herosection-content-wrapper">
          {!hide_header_image && image_url ? (
            <>
              <BodyClass className="has-hero-image" />
              <div
                className="herosection-content-image document-image"
                style={{
                  backgroundImage: `url(${image_url})`,
                }}
              />
              <img
                className="herosection-content-image document-image"
                src={image_url}
                style={{maxWidth: '100%', display:'none'}}
              />
              <div className="caption">
                {preview_caption && (
                  <p className="content-image-caption">{preview_caption}</p>
                )}
              </div>
            </>
          ) : (
            <div className="herosection-missing-image"></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
