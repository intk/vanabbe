import { defineMessages } from 'react-intl';

const messages = defineMessages({
  placeholder: {
    id: 'placeholder',
    defaultMessage: 'Placeholder',
  },
});

export const InputSchemaExtender = (intl) => {
  return {
    fields: ['placeholder'],
    properties: {
      placeholder: {
        title: intl.formatMessage(messages.placeholder),
      },
    },
    required: [],
  };
};

export const EmailSchemaExtender = (intl) => {
  return {
    fields: ['placeholder', 'fixedFieldId'],
    properties: {
      fixedFieldId: {
        title: 'Field Id (fixed)',
        send_to_backend: true,
      },
      placeholder: {
        title: intl.formatMessage(messages.placeholder),
      },
    },
    required: [],
  };
};
