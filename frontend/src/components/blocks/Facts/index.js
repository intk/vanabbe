import downloadSVG from '@plone/volto/icons/download.svg';

import FactsView from './FactsView';
import FactsEdit from './FactsEdit';

const installFactsBlock = (config) => {
  config.blocks.blocksConfig.facts = {
    id: 'facts',
    title: 'Facts',
    icon: downloadSVG,
    group: 'common',
    view: FactsView,
    edit: FactsEdit,
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
