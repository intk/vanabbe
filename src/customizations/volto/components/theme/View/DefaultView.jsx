import React from 'react';

import { RenderBlocks } from '@plone/volto/components';
import { Container, Grid } from 'semantic-ui-react';

import { hasBlocksData, getBaseUrl } from '@plone/volto/helpers';

function filterBlocks(content, items, hiddenBlocks) {
  if (!(content.blocks && content.blocks_layout?.items)) return content;

  return {
    ...content,
    blocks_layout: {
      ...content.blocks_layout,
      items: hiddenBlocks
        ? items.filter(
            (id) => hiddenBlocks.indexOf(content.blocks[id]?.['@type']) === -1,
          )
        : items,
    },
  };
}

const DefaultView = (props) => {
  const { content, location } = props;
  const path = getBaseUrl(location?.pathname || '');
  const hiddenBlocks = ['title', 'description']; //  hide title and description blocks, as they are included in the header
  const blocksLayout = content?.blocks_layout?.items || [];
  const dividerBlock = content?.blocks
    ? Object.keys(content?.blocks).find(
        (id) => content?.blocks?.[id]?.['@type'] === 'contentDividerBlock',
      )
    : {};
  const blockIndexToSplit = blocksLayout.indexOf(dividerBlock);
  const blocksWithBG = blocksLayout.slice(0, blockIndexToSplit);
  const blocksWithoutBG = blocksLayout.slice(blockIndexToSplit + 1);
  const filterContent = filterBlocks(content, blocksLayout, hiddenBlocks);
  const filterContentBlocksBefore = filterBlocks(
    content,
    blocksWithBG,
    hiddenBlocks,
  );
  const filterContentBlocksAfter = filterBlocks(
    content,
    blocksWithoutBG,
    hiddenBlocks,
  );

  return hasBlocksData(content) ? (
    <div id="page-document" className="ui container">
      <div className="content-container">
        <Grid>
          <Grid.Row>
            <Grid.Column className="column-offset-1-right">
              <div className="content-wrapper">
                <Grid>
                  <Grid.Row>
                    <Grid.Column>
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
                          <RenderBlocks
                            {...props}
                            path={path}
                            content={filterContent}
                          />
                        </div>
                      )}
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
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
