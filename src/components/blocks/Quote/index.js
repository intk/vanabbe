import codeSVG from '@plone/volto/icons/row.svg';
import QuoteBlockView from './QuoteBlockView';
import QuoteBlockEdit from './QuoteBlockEdit';
import { Simple, Surrounded } from './QuoteBlockView';

export default function applyConfig(config) {
  config.blocks.blocksConfig.quoteBlock = {
    id: 'quoteBlock',
    title: 'Quote',
    icon: codeSVG,
    group: 'common',
    view: QuoteBlockView,
    edit: QuoteBlockEdit,
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
        template: Simple,
      },
      {
        id: 'quoteMarks',
        title: 'Quotation marks',
        template: Surrounded,
      },
    ],
  };
  return config;
}
