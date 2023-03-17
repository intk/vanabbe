import codeSVG from '@plone/volto/icons/row.svg';
import StyledBlockView, { SmallText } from './StyledTextBlockView';
import StyledBlockEdit from './StyledTextBlockEdit';
import Schema from './schema';

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
    blockSchema: Schema(),
    variations: [
      {
        id: 'default',
        isDefault: true,
        title: 'Default',
        template: SmallText,
        schemaEnhancer: ({ schema }) => {
          // TODO: there is a bug here, Victor said that he fixed it, but it's
          // not in current Volto
          return { ...schema, title: 'Small text' };
        },
      },
    ],
  };
  return config;
}
