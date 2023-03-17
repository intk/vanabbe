import React from 'react';
import { SidebarPortal, BlockDataForm } from '@plone/volto/components';
import ColumnEdit from './ColumnEdit';
import Schema from './schema';

const StyledTextBlockEdit = (props) => {
  const { selected, onChangeBlock, block, data } = props;

  const schema = Schema();

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
