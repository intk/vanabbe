import codeSVG from '@plone/volto/icons/row.svg';
import StyledBlockView, { SmallText } from './StyledTextBlockView';
import StyledBlockEdit from './StyledTextBlockEdit';

export default function applyConfig(config) {
  config.blocks.blocksConfig.styledText = {
    id: 'styledText',
    title: 'Small text',
    icon: codeSVG,
    group: 'common',
    view: StyledBlockView,
    edit: StyledBlockEdit,
    restricted: false,
    mostUsed: false,
    blockHasOwnFocusManagement: true,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
    variations: [
      {
        id: 'default',
        isDefault: true,
        title: 'Default',
        template: SmallText,
      },
    ],
  };
  return config;
}
