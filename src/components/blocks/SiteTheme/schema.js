import { defineMessages } from 'react-intl';
import config from '@plone/volto/registry';

const messages = defineMessages({
  themeTitle: {
    id: 'themeTitle',
    defaultMessage: 'Theme',
  },
  themeDescription: {
    id: 'themeDescription',
    defaultMessage: 'Select a theme for this page',
  },
  SiteTheme: {
    id: 'SiteTheme',
    defaultMessage: 'Global site settings',
  },
});

const SiteThemeSchema = ({ intl }) => {
  var themes = config.settings.siteThemes.map(({ name, value }) => [
    value,
    name,
  ]);

  return {
    title: intl.formatMessage(messages.SiteTheme),
    fieldsets: [
      {
        id: 'default',
        fields: ['theme'],
        title: 'Default',
      },
    ],

    properties: {
      theme: {
        title: intl.formatMessage(messages.themeTitle),
        description: intl.formatMessage(messages.themeDescription),
        choices: themes,
      },
    },
    required: [],
  };
};

export default SiteThemeSchema;
