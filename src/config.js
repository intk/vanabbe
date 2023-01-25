import loadable from '@loadable/component';
import { defineMessages } from 'react-intl';
import CookieBanner from 'volto-cookie-banner/CookieBannerContainer';
import { MultilingualWidget } from 'volto-multilingual-widget';

import { getContent, getNavigation } from '@plone/volto/actions';
import { getBaseUrl } from '@plone/volto/helpers';

import installBlocks from './components/blocks';
import installFooter from './footer';

import AttachedImageWidget from './components/widgets/AttachedImageWidget';
import MultipleContentView from './components/theme/View/MultipleContentView';
import ListingView from './components/theme/View/ListingView';
import PublicationView from './components/theme/View/PublicationView';
import ArtworkView from './components/theme/View/ArtworkView';

import installExpressMiddleware from './express-middleware';

import { SiteTheme } from '@package/components';

// import installStyleMenu from 'volto-slate/editor/plugins/StyleMenu';
// import defaultFieldSchema from 'volto-form-block/fieldSchema';

// import TagManager from 'react-gtm-module';

// All your imports required for the config here BEFORE this line
import '@plone/volto/config';

// const tagManagerArgs = {
//   gtmId: 'GTM-T8SF8PJ',
// };

defineMessages({
  contact: {
    id: 'Contact',
    defaultMessage: 'Contact',
  },
  calendar: {
    id: 'Add to calendar',
    defaultMessage: 'Add to calendar',
  },
  homepage: {
    id: 'Go to the homepage of Van Abbemuseum',
    defaultMessage: 'Go to the homepage of Van Abbemuseum',
  },
});

const THEMES = [
  { name: 'Default', value: 'default' },
  { name: 'Yellow', value: 'yellow' },
  { name: 'Beige', value: 'beige' },
  { name: 'Sunny', value: 'sunny' },
  { name: 'Blue', value: 'blue' },
  { name: 'Dandelion', value: 'dandelion' },
  { name: 'Latte', value: 'latte' },
  { name: 'Bubbles', value: 'bubbles' },
  { name: 'Misty', value: 'misty' },
  { name: 'Lavender', value: 'lavender' },
  { name: 'Topaz', value: 'topaz' },
  { name: 'Almond', value: 'almond' },
  { name: 'Aqua', value: 'aqua' },
  { name: 'Orange', value: 'orange' },
  { name: 'Peach', value: 'peach' },
  { name: 'Marine', value: 'marine' },
  { name: 'Snow', value: 'snow' },
  { name: 'Summer', value: 'summer' },
  { name: 'Lime', value: 'lime' },
  { name: 'Mint', value: 'mint' },
  { name: 'Rose', value: 'rose' },
  { name: 'Olive', value: 'olive' },
  { name: 'Melon', value: 'melon' },
  { name: 'Sand', value: 'sand' },
  { name: 'Lemon', value: 'lemon' },
  { name: 'Ivory', value: 'ivory' },
  { name: 'Turquoise', value: 'turquoise' },
  { name: 'Light green', value: 'light-green' },
  { name: 'Pink', value: 'pink' },
  { name: 'Flamingo', value: 'flamingo' },
  { name: 'Sky', value: 'sky' },
  { name: 'Cyan', value: 'cyan' },
  { name: 'Lilac', value: 'lilac' },
  { name: 'Blush pink', value: 'blush-pink' },
  { name: 'Smoke', value: 'smoke' },
  { name: 'Pale green', value: 'pale-green' },
];

// __CLIENT__ && !__DEVELOPMENT__ && TagManager.initialize(tagManagerArgs);

export default function applyConfig(config) {
  // Add here your project's configuration here by modifying `config` accordingly

  // installStyleMenu(config);

  const DEFAULT_LANG = 'nl';

  config.settings.isMultilingual = true;
  config.settings.supportedLanguages = ['nl', 'en'];
  config.settings.defaultLanguage = DEFAULT_LANG;

  config.settings.siteDataPageId = 'site-data';
  config.settings.actionBlockIds = [
    ['footerLinks', 'Footer Links'],
    ['siteActions', 'Site Actions'],
  ];

  config.settings.siteThemes = THEMES;

  config.blocks.blocksConfig.title.view = () => null;
  config.blocks.groupBlocksOrder.push({ id: 'site', title: 'Site' });

  config.settings = {
    ...config.settings,
    navDepth: 3,
  };

  config.settings.loadables = {
    ...config.settings.loadables,
    dateFns: loadable.lib(() => import('date-fns')),
  };

  // config.settings.slate.styleMenu = {
  //   inlineStyles: [],
  //   blockStyles: [
  //     { cssClass: 'discreetBlock', label: 'Discreet' },
  //     { cssClass: 'p2', label: 'Secondary' },
  //     //{ cssClass: 'buttonSec', label: 'Secondary button' },
  //   ],
  // };

  config.settings.apiExpanders = [
    ...config.settings.apiExpanders,
    {
      match: '',
      GET_CONTENT: ['translations'],
    },
  ];

  config.settings.asyncPropsExtenders = [
    ...config.settings.asyncPropsExtenders,
    {
      path: '/',
      key: 'site-data',
      extend: (dispatchActions) => {
        const action = {
          key: 'site-data',
          promise: ({ location, store }) => {
            // const currentLang = state.intl.locale;
            const bits = location.pathname.split('/');
            const currentLang =
              bits.length >= 2 ? bits[1] || DEFAULT_LANG : DEFAULT_LANG;

            const state = store.getState();
            if (state.content.subrequests?.[`site-data-${currentLang}`]?.data) {
              return;
            }

            const siteDataPageId = config.settings.siteDataPageId;
            const url = `/${currentLang}/${siteDataPageId}`;
            const action = getContent(url, null, `site-data-${currentLang}`);
            return store.dispatch(action).catch((e) => {
              // eslint-disable-next-line
              console.log(
                `Footer links folder not found: ${url}. Please create as page
                named ${siteDataPageId} in the root of your current language and
                fill it with the appropriate action blocks`,
              );
            });
          },
        };
        return [...dispatchActions, action];
      },
    },
    {
      key: 'navigation',
      path: '/',
      extend: (dispatchActions) => {
        const action = {
          key: 'navigation',
          promise: ({ location, store: { dispatch } }) => {
            // Customized, we don't want SERVER as a condition
            return dispatch(
              getNavigation(
                getBaseUrl(location.pathname),
                config.settings.navDepth,
              ),
            );
          },
        };
        const actions = [
          ...dispatchActions.filter(({ key }) => key !== 'navigation'),
          action,
        ];
        return actions;
      },
    },
  ];

  config.views.layoutViews.multiple_content = MultipleContentView;
  config.views.layoutViews.listing_view = ListingView;
  config.views.layoutViewsNamesMapping.multiple_content = 'Section layout';
  config.views.contentTypesViews.publication = PublicationView;
  config.views.contentTypesViews.artwork = ArtworkView;

  config.widgets.widget.attachedimage = AttachedImageWidget;
  config.widgets.id.cookie_consent_configuration = MultilingualWidget();

  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    {
      match: '',
      component: CookieBanner,
    },
    {
      match: '',
      component: SiteTheme,
    },
  ];

  config.blocks.initialBlocks = {
    ...config.blocks.initialBlocks,
    Document: [
      'title',
      'siteTheme',
      'description',
      'slate',
      'contentDividerBlock',
    ],
    Event: ['title', 'siteTheme', 'description', 'slate'],
    'News Item': ['title', 'siteTheme', 'description', 'slate'],
  };

  config.blocks.initialBlocksFocus = {
    ...config.blocks.initialBlocksFocus,
    Document: 'title',
    Event: 'title',
    'News Item': 'title',
  };

  console.log('config', config.settings.defaultLanguage);

  return installExpressMiddleware(installFooter(installBlocks(config)));
}
