import React from 'react';
import { Grid } from 'semantic-ui-react'; //Container
import { BodyClass } from '@plone/volto/helpers';
// import { Breadcrumbs } from '@plone/volto/components';
// import { useLocation } from 'react-router-dom';

function HeroSection(props) {
  const { image_url, content } = props;
  const { title, preview_caption, description } = content || {};
  // const location = useLocation();

  return (
    <div className="herosection-wrapper">
      {/* <Breadcrumbs pathname={location.pathname} /> */}

      <Grid>
        <Grid.Row>
          <Grid.Column className="column-offset-1-left column-offset-2-right">
            {title && <h1 className="content-title">{title}</h1>}
            {description && (
              <p className="content-description">{description}</p>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Grid>
        <Grid.Row>
          <Grid.Column className="column-offset-1-right">
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
              <div className="caption">
                {preview_caption && (
                  <p className="content-image-caption">{preview_caption}</p>
                )}
              </div>
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      {/* {title && <h1 className="content-title">{title}</h1>}
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
        </div> */}
    </div>
  );
}

export default HeroSection;
