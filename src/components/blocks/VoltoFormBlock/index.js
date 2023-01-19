import { InputSchemaExtender, EmailSchemaExtender } from './schemaExtender';
import { default as FormCustomView } from './View';
import formSchema from './formSchema';

export default (config) => {
  config.blocks.blocksConfig.form = {
    ...config.blocks.blocksConfig.form,
    view: FormCustomView,
    formSchema: formSchema,
    fieldTypeSchemaExtenders: {
      ...config.blocks.blocksConfig.form.fieldTypeSchemaExtenders,
      textarea: InputSchemaExtender,
      text: InputSchemaExtender,
      from: EmailSchemaExtender,
    },
    additionalFields: [],
  };

  return config;
};
