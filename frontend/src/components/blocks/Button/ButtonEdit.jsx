import React from 'react';
import { BlockDataForm, SidebarPortal } from '@plone/volto/components';

import ButtonBlockSchema from './schema';
import ButtonView from './ButtonView';

const ButtonEdit = (props) => {
  const { block, onChangeBlock, data = {}, selected } = props;
  const schema = ButtonBlockSchema(props);

  return (
    <>
      <ButtonView {...props} mode="edit" />

      <SidebarPortal selected={selected}>
        <BlockDataForm
          key={Object.keys(data?.cards || {}).length}
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
    </>
  );
};

export default ButtonEdit;
