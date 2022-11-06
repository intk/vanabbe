import React from 'react';
import { SidebarPortal, BlockDataForm } from '@plone/volto/components';
import ColumnEdit from './ColumnEdit';
import QuoteBlockSchema from './schema';

const QuoteBlockEdit = (props) => {
  const { selected, onChangeBlock, block, data } = props;
  const schema = QuoteBlockSchema();

  return (
    <div className="block-editor-group">
      <ColumnEdit {...props} title="Quote block" />

      <SidebarPortal selected={selected}>
        <BlockDataForm
          title="Quote"
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

export default QuoteBlockEdit;
