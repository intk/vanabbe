import heroSVG from '@plone/volto/icons/hero.svg';

import HeroUnitView from './HeroUnitView';
import HeroUnitEdit from './HeroUnitEdit';

const installHeroUnitBlock = (config) => {
  config.blocks.blocksConfig.heroUnitBlock = {
    id: 'heroUnitBlock',
    title: 'Hero Unit',
    icon: heroSVG,
    group: 'site',
    view: HeroUnitView,
    edit: HeroUnitEdit,
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

export default installHeroUnitBlock;
