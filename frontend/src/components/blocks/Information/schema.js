import { defineMessages } from 'react-intl';

const messages = defineMessages({
  headline: {
    id: 'Headline',
    defaultMessage: 'Headline',
  },
  headlineLink: {
    id: 'headlineLink',
    default: 'Headline Link',
  },
  buttonLinks: {
    id: 'buttonLinks',
    defaultMessage: 'Button Links',
  },
  buttonTitle: {
    id: 'Button title',
    defaultMessage: 'Button title',
  },
  callAction: {
    id: 'Button call to action',
    defaultMessage: 'Button call to action',
  },
  buttonLink: {
    id: 'Button link',
    defaultMessage: 'Button link',
  },
  Information: {
    id: 'infoBlock',
    defaultMessage: 'Info block',
  },
});

export const ButtonLink = (intl) => ({
  title: intl.formatMessage(messages.buttonLink),
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['href', 'title'],
    },
  ],
  properties: {
    title: {
      title: intl.formatMessage(messages.buttonTitle),
    },
    href: {
      title: intl.formatMessage(messages.callAction),
      widget: 'object_browser',
      mode: 'link',
      selectedItemAttrs: ['Title', 'Description'],
      allowExternals: true,
    },
  },
  required: ['title', 'href'],
});

const InformationBlockSchema = ({ intl }) => ({
  title: intl.formatMessage(messages.Information),
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['headline', 'headlinelink', 'text', 'buttons'],
    },
  ],

  properties: {
    headline: {
      title: intl.formatMessage(messages.headline),
    },
    headlinelink: {
      title: intl.formatMessage(messages.headlineLink),
      widget: 'object_browser',
      mode: 'link',
      selectedItemAttrs: ['Title', 'Description'],
      allowExternals: true,
    },
    text: {
      title: 'Text',
      widget: 'slate_richtext',
    },
    buttons: {
      title: intl.formatMessage(messages.buttonLinks),
      widget: 'object_list',
      schema: ButtonLink(intl),
    },
  },
  required: [],
});

export default InformationBlockSchema;
