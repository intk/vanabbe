import FormSchema from 'volto-form-block/formSchema';

export default function formSchema() {
  const schema = FormSchema();
  schema.properties.bottomText = {
    title: 'Bottom Text',
    widget: 'slate_richtext',
  };
  schema.fieldsets[0].fields.push('bottomText');

  return schema;
}
