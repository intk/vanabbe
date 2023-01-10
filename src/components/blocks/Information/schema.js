import { defineMessages } from 'react-intl';

export const ButtonLink = (props) => ({
  title: 'Button link',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['href', 'title'],
    },
  ],
  properties: {
    title: {
      title: 'Button title',
    },
    href: {
      title: 'Call to action',
      widget: 'object_browser',
      mode: 'link',
      selectedItemAttrs: ['Title', 'Description'],
      allowExternals: true,
    },
  },
  required: ['title', 'href'],
});

const messages = defineMessages({
  headline: {
    id: 'headline',
    defaultMessage: 'Headline',
  },
  buttonLinks: {
    id: 'buttonLinks',
    defaultMessage: 'Button Links',
  },
  Information: {
    id: 'infoBlock',
    defaultMessage: 'Information block',
  },
});

const InformationSchema = ({ intl }) => ({
  title: intl.formatMessage(messages.Information),
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['headline', 'text', 'buttons'],
    },
  ],

  properties: {
    headline: {
      title: intl.formatMessage(messages.headline),
    },
    text: {
      title: 'Text',
      widget: 'slate_richtext',
    },
    buttons: {
      title: intl.formatMessage(messages.buttonLinks),
      widget: 'object_list',
      schema: ButtonLink(),
    },
  },
  required: [],
});

export default InformationSchema;
