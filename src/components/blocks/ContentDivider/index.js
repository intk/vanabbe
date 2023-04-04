import ContentDividerEdit from './ContentDividerEdit';
import iconSVG from '@plone/volto/icons/divide-horizontal.svg';

const installContentDividerBlock = (config) => {
  config.blocks.blocksConfig.contentDividerBlock = {
    id: 'contentDividerBlock',
    title: 'Content divider',
    icon: iconSVG,
    group: 'site',
    edit: ContentDividerEdit,
    view: () => null,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };

  return config;
};

export default installContentDividerBlock;
