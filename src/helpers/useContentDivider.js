export const filterBlocks = (content, items, hiddenBlocks) => {
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
};

const useContentDivider = (content, hiddenBlocks) => {
  const blocksLayout = content?.blocks_layout?.items || [];
  const dividerBlock = content?.blocks
    ? Object.keys(content?.blocks).find(
        (id) => content?.blocks?.[id]?.['@type'] === 'contentDividerBlock',
      )
    : null;

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

  return {
    dividerBlock,
    filterContent,
    filterContentBlocksBefore,
    filterContentBlocksAfter,
  };
};

export default useContentDivider;
