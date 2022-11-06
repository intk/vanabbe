import downloadSVG from '@plone/volto/icons/download.svg';

import ActionLinksView from './ActionLinksView';
import ActionLinksEdit from './ActionLinksEdit';

const installFactsBlock = (config) => {
  config.blocks.blocksConfig.actionLinks = {
    id: 'actionLinks',
    title: 'Action Links',
    icon: downloadSVG,
    group: 'site',
    view: ActionLinksView,
    edit: ActionLinksEdit,
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

export default installFactsBlock;
