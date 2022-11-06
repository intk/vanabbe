import { defineMessages } from 'react-intl';

const messages = defineMessages({
  Button: {
    id: 'Button',
    defaultMessage: 'Button',
  },
});

const ButtonSchema = ({ onChangeBlock, intl, data, openObjectBrowser }) => ({
  title: intl.formatMessage(messages.Button),
  fieldsets: [
    {
      id: 'default',
      fields: ['linkTitle', 'linkHref', 'btnStyle'], //  'url'
      title: 'Default',
    },
  ],

  properties: {
    linkTitle: {
      title: 'Button title',
    },
    linkHref: {
      title: 'Call to action',
      widget: 'object_browser',
      mode: 'link',
      selectedItemAttrs: ['Title', 'Description'],
      allowExternals: true,
    },
    btnStyle: {
      title: 'Style',
      choices: [
        ['primary', 'Primary'],
        ['secondary', 'Secondary'],
      ],
    },
  },
  required: [],
});

export default ButtonSchema;
