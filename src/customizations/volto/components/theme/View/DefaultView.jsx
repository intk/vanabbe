import React from 'react';

import { RenderBlocks } from '@plone/volto/components';
import { Container } from 'semantic-ui-react';

import { hasBlocksData, getBaseUrl } from '@plone/volto/helpers';

// Customized to hide the title and description blocks, as they are included in
// the header

function filterBlocks(content, types) {
  if (!(content.blocks && content.blocks_layout?.items)) return content;

  return {
    ...content,
    blocks_layout: {
      ...content.blocks_layout,
      items: content.blocks_layout.items.filter(
        (id) => types.indexOf(content.blocks[id]?.['@type']) === -1,
      ),
    },
  };
}

const DefaultView = (props) => {
  const { content, location } = props;
  const path = getBaseUrl(location?.pathname || '');

  const description = content?.description;
  const hasLeadImage = content?.preview_image;
  const filteredContent = hasLeadImage
    ? filterBlocks(content, ['title', 'description'])
    : content;

  return hasBlocksData(content) ? (
    <div id="page-document" className="ui container">
      <div className="content-container">
        <div className="content-wrapper">
          {description && (
            <p className={'content-description'}>{description}</p>
          )}
        </div>
        <RenderBlocks {...props} path={path} content={filteredContent} />
      </div>
    </div>
  ) : (
    <Container id="page-document">
      <div className="content-container">
        {/* default title+description blocks are inserted by the HeroSection */}
        {content.remoteUrl && (
          <span>
            The link address is:
            <a href={content.remoteUrl}>{content.remoteUrl}</a>
          </span>
        )}
        {content.text && (
          <div
            dangerouslySetInnerHTML={{
              __html: content.text.data,
            }}
          />
        )}
      </div>
    </Container>
  );
};

//    <h1 className="documentFirstHeading">{content.title}</h1>
//    {content.description && (
//      <p className="documentDescription">{content.description}</p>
//    )}
//    {content.preview_image && (
//      <Image
//        className="document-image"
//        src={content.preview_image.scales.thumb.download}
//        floated="right"
//      />
//    )}

export default DefaultView;
