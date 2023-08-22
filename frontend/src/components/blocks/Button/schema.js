import { defineMessages } from 'react-intl';

const messages = defineMessages({
  Button: {
    id: 'Button',
    defaultMessage: 'Button',
  },
  buttonTitle: {
    id: 'Button title',
    defaultMessage: 'Button title',
  },
  callAction: {
    id: 'Button call to action',
    defaultMessage: 'Button call to action',
  },
});

const ButtonSchema = ({ onChangeBlock, intl, data, openObjectBrowser }) => ({
  title: intl.formatMessage(messages.Button),
  fieldsets: [
    {
      id: 'default',
      fields: ['linkTitle', 'linkHref', 'btnStyle'],
      title: 'Default',
    },
  ],

  properties: {
    linkTitle: {
      title: intl.formatMessage(messages.buttonTitle),
    },
    linkHref: {
      title: intl.formatMessage(messages.callAction),
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
