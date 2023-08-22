import heroSVG from '@plone/volto/icons/hero.svg';

import SearchOverviewView from './SearchOverviewView';
import SearchOverviewEdit from './SearchOverviewEdit';

const install = (config) => {
  config.blocks.blocksConfig.searchOverview = {
    id: 'searchOverview',
    title: 'Search Page Header',
    icon: heroSVG,
    group: 'site',
    view: SearchOverviewView,
    edit: SearchOverviewEdit,
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

export default install;
