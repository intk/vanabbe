import config from '@plone/volto/registry';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  // icon: {
  //   id: 'icon',
  //   defaultMessage: 'Icon',
  // },
  title: {
    id: 'title',
    defaultMessage: 'Title',
  },
  LinkTo: {
    id: 'LinkTo',
    defaultMessage: 'Action link',
  },
  Actions: {
    id: 'Actions',
    defaultMessage: 'Actions',
  },
  Action: {
    id: 'Action',
    defaultMessage: 'Action',
  },
});

const ActionSchema = ({ onChangeBlock, intl, data, openObjectBrowser }) => ({
  title: intl.formatMessage(messages.Action),
  fieldsets: [
    {
      id: 'default',
      fields: ['title', 'href'], //  'url'
      title: 'Default',
    },
  ],

  properties: {
    title: {
      title: intl.formatMessage(messages.title),
    },
    href: {
      title: 'Link',
      description: 'Internal page or path',
      widget: 'url',
    },
  },
  required: [],
});

const schema = ({ onChangeBlock, intl, data, openObjectBrowser }) => ({
  fieldsets: [
    {
      id: 'default',
      fields: ['globalId', 'actions'], // 'title', 'linkTitle', 'linkHref', 'cards'
      title: 'Default',
    },
  ],

  properties: {
    globalId: {
      title: 'Global ID',
      description:
        'The global block is uniquely identifies this actions block and allows its use in the website.',
      // TODO: filter the available ids based on existing blocks in data
      choices: config.settings.actionBlockIds || [],
    },
    actions: {
      title: intl.formatMessage(messages.Actions),
      widget: 'object_list',
      schema: ActionSchema({ onChangeBlock, intl, data, openObjectBrowser }),
    },
  },
  required: [],
});

export default schema;
