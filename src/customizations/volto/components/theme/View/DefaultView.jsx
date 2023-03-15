import React from 'react';

import { RenderBlocks } from '@plone/volto/components';
import { Container } from 'semantic-ui-react';

import { hasBlocksData, getBaseUrl } from '@plone/volto/helpers';
import { useContentDivider } from '@package/helpers';

const DefaultView = (props) => {
  const { content, location } = props;
  const path = getBaseUrl(location?.pathname || '');
  const hiddenBlocks = ['title', 'description']; //  hide title and description blocks, as they are included in the header
  const {
    dividerBlock,
    filterContent,
    filterContentBlocksBefore,
    filterContentBlocksAfter,
  } = useContentDivider(content, hiddenBlocks);

  return hasBlocksData(content) ? (
    <div id="page-document" className="ui container">
      <div className="offset-1-right">
        <div className="content-wrapper">
          <div>
            {dividerBlock ? (
              <>
                <div className="blocks-bg-wrapper">
                  <RenderBlocks
                    {...props}
                    path={path}
                    content={filterContentBlocksBefore}
                  />
                </div>
                <RenderBlocks
                  {...props}
                  path={path}
                  content={filterContentBlocksAfter}
                />
              </>
            ) : (
              <div className="blocks-wrapper">
                <RenderBlocks {...props} path={path} content={filterContent} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Container id="page-document">
      <div className="content-container">
        {/* default title+description blocks are inserted by the HeroSection */}
        {content?.remoteUrl && (
          <span>
            The link address is:
            <a href={content.remoteUrl}>{content.remoteUrl}</a>
          </span>
        )}
        {content?.text && (
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

export default DefaultView;
