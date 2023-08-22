import codeSVG from '@plone/volto/icons/row.svg';
import StyledBlockView, { SmallText, NormalText } from './StyledTextBlockView';
import StyledBlockEdit from './StyledTextBlockEdit';
import Schema from './schema';
import { cloneDeep } from 'lodash';

export default function applyConfig(config) {
  config.blocks.blocksConfig.styledText = {
    id: 'styledText',
    title: 'Text section',
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
        title: 'Small text',
        template: SmallText,
        schemaEnhancer: ({ schema }) => ({ ...schema, title: 'Small text' }),
      },
      {
        id: 'normal',
        isDefault: false,
        title: 'Normal text',
        template: NormalText,
        schemaEnhancer: ({ schema }) => {
          schema = cloneDeep(schema);
          schema.title = 'Normal text';
          schema.fieldsets[0].fields = ['globalId'];
          schema.properties.globalId = {
            title: 'Global ID',
            description: 'Identify this block for templating purposes',
            // TODO: filter the available ids based on existing blocks in data
            choices: [['artwork_details', 'Artwork details']],
            default: 'artwork_details',
          };

          return schema;
        },
      },
    ],
  };
  return config;
}
