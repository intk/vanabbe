import config from '@plone/volto/registry';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
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
  blockTitle: {
    id: 'blockTitle',
    defaultMessage: 'Block title',
  },
  linkDescription: {
    id: 'Internal page or path',
    defaultMessage: 'Internal page or path',
  },
  globalIdDescription: {
    id:
      'The global block is uniquely identifies this actions block and allows its use in the website',
    defaultMessage:
      'The global block is uniquely identifies this actions block and allows its use in the website',
  },
});

const ActionSchema = ({ onChangeBlock, intl, data, openObjectBrowser }) => ({
  title: intl.formatMessage(messages.Action),
  fieldsets: [
    {
      id: 'default',
      fields: ['title', 'href'],
      title: 'Default',
    },
  ],

  properties: {
    title: {
      title: intl.formatMessage(messages.title),
    },
    href: {
      title: 'Link',
      description: intl.formatMessage(messages.linkDescription),
      widget: 'url',
    },
  },
  required: [],
});

const schema = ({ onChangeBlock, intl, data, openObjectBrowser }) => ({
  fieldsets: [
    {
      id: 'default',
      fields: ['blockTitle', 'globalId', 'actions'],
      title: 'Default',
    },
  ],

  properties: {
    blockTitle: {
      title: intl.formatMessage(messages.blockTitle),
    },
    globalId: {
      title: 'Global ID',
      description: intl.formatMessage(messages.globalIdDescription),
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
