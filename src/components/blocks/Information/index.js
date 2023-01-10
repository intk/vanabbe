import indentSVG from '@plone/volto/icons/indent.svg';

import InformationView from './InformationView';
import InformationEdit from './InformationEdit';

const installInformationBlock = (config) => {
  config.blocks.blocksConfig.informationBlock = {
    id: 'informationBlock',
    title: 'Information block',
    icon: indentSVG,
    group: 'site',
    view: InformationView,
    edit: InformationEdit,
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

export default installInformationBlock;
