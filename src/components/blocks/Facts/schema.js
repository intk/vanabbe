import { defineMessages } from 'react-intl';

const messages = defineMessages({
  icon: {
    id: 'icon',
    defaultMessage: 'Icon',
  },
  title: {
    id: 'title',
    defaultMessage: 'Title',
  },
  image: {
    id: 'image',
    defaultMessage: 'Image',
  },
  subtitle: {
    id: 'subtitle',
    defaultMessage: 'SubTitle',
  },
  LinkTo: {
    id: 'LinkTo',
    defaultMessage: 'Action link',
  },
  Cards: {
    id: 'Cards',
    defaultMessage: 'Cards',
  },
  Card: {
    id: 'Card',
    defaultMessage: 'Card',
  },
  linkToDescription: {
    id: 'linkToDescription',
    defaultMessage: 'Destination for the call to action button',
  },
});

const CardSchema = ({ onChangeBlock, intl, data, openObjectBrowser }) => ({
  title: intl.formatMessage(messages.Card),
  fieldsets: [
    {
      id: 'default',
      fields: ['title', 'subtitle'], //  'url'
      title: 'Default',
    },
  ],

  properties: {
    title: {
      title: intl.formatMessage(messages.title),
    },
    subtitle: {
      title: intl.formatMessage(messages.subtitle),
    },
    // url: {
    //   title: intl.formatMessage(messages.image),
    //   widget: 'attachedimage',
    // },
  },
  required: [],
});

const schema = ({ onChangeBlock, intl, data, openObjectBrowser }) => ({
  fieldsets: [
    {
      id: 'default',
      fields: ['title', 'linkTitle', 'linkHref', 'cards'],
      title: 'Basics',
    },
  ],

  properties: {
    title: {
      title: intl.formatMessage(messages.title),
      description: 'Main block title',
    },
    cards: {
      title: intl.formatMessage(messages.Cards),
      widget: 'object_list',
      schema: CardSchema({ onChangeBlock, intl, data, openObjectBrowser }),
    },

    linkHref: {
      title: 'Call to action',
      widget: 'object_browser',
      mode: 'link',
      selectedItemAttrs: ['Title', 'Description'],
      allowExternals: true,
    },
    linkTitle: {
      title: 'Button title',
    },
  },
  required: [],
});

export default schema;
