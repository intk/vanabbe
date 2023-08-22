import SiteThemeView from './SiteThemeView';
import SiteThemeEdit from './SiteThemeEdit';
import themeSVG from '@plone/volto/icons/theme.svg';

const installSiteThemeBlock = (config) => {
  config.blocks.blocksConfig.siteTheme = {
    id: 'siteTheme',
    title: 'Site theme',
    icon: themeSVG,
    group: 'site',
    view: SiteThemeView,
    edit: SiteThemeEdit,
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

export default installSiteThemeBlock;
