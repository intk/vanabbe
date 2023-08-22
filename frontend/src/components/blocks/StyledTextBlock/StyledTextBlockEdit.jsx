import React from 'react';
import { SidebarPortal, BlockDataForm } from '@plone/volto/components';
import { applySchemaEnhancer } from '@plone/volto/helpers';

import ColumnEdit from './ColumnEdit';
import Schema from './schema';

const StyledTextBlockEdit = (props) => {
  const { selected, onChangeBlock, block, data, intl } = props;

  const schema = applySchemaEnhancer({
    schema: Schema(),
    formData: data,
    intl,
  });

  return (
    <div className="block-editor-group">
      <ColumnEdit {...props} title={schema.title} />

      <SidebarPortal selected={selected}>
        <BlockDataForm
          title={schema.title}
          schema={schema}
          onChangeField={(id, value) => {
            onChangeBlock(block, {
              ...data,
              [id]: value,
            });
          }}
          formData={data}
        />
      </SidebarPortal>
    </div>
  );
};

export default StyledTextBlockEdit;
