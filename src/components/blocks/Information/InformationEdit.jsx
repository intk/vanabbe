import React from 'react';
import { BlockDataForm, SidebarPortal } from '@plone/volto/components';
import { getBaseUrl } from '@plone/volto/helpers';
import InformationSchema from './schema';
import InformationView from './InformationView';

const InformationEdit = (props) => {
  const { block, onChangeBlock, data = {}, selected } = props;
  const schema = InformationSchema(props);

  return (
    <>
      <InformationView
        {...props}
        path={getBaseUrl(props.pathname)}
        mode="edit"
      />

      <SidebarPortal selected={selected}>
        <BlockDataForm
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
export default InformationEdit;
