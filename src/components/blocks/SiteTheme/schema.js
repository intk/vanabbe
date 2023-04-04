import { defineMessages } from 'react-intl';
import config from '@plone/volto/registry';

const messages = defineMessages({
  theme: {
    id: 'Theme',
    defaultMessage: 'Theme',
  },
  themeDescription: {
    id: 'Select a theme for this page',
    defaultMessage: 'Select a theme for this page',
  },
  siteTheme: {
    id: 'Site Theme',
    defaultMessage: 'Site Theme',
  },
});

const SiteThemeSchema = ({ intl }) => {
  var themes = config.settings.siteThemes.map(({ name, value }) => [
    value,
    name,
  ]);

  return {
    title: intl.formatMessage(messages.siteTheme),
    fieldsets: [
      {
        id: 'default',
        fields: ['theme'],
        title: 'Default',
      },
    ],

    properties: {
      theme: {
        title: intl.formatMessage(messages.theme),
        description: intl.formatMessage(messages.themeDescription),
        choices: themes,
        default: 'default',
      },
    },
    required: [],
  };
};

export default SiteThemeSchema;
