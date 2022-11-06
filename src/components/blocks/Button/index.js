import aheadSVG from '@plone/volto/icons/ahead.svg';

import ButtonView from './ButtonView';
import ButtonEdit from './ButtonEdit';

const installButtonBlock = (config) => {
  config.blocks.blocksConfig.buttonBlock = {
    id: 'buttonBlock',
    title: 'Button',
    icon: aheadSVG,
    group: 'common',
    view: ButtonView,
    edit: ButtonEdit,
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

export default installButtonBlock;
