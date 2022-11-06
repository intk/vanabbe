import React from 'react';
import { BlockDataForm, SidebarPortal } from '@plone/volto/components';
import { getBaseUrl } from '@plone/volto/helpers';
import FactsBlockSchema from './schema';
import FactsView from './FactsView';

const FactsEdit = (props) => {
  const { block, onChangeBlock, data = {}, selected } = props;
  const schema = FactsBlockSchema(props);

  return (
    <>
      <FactsView {...props} path={getBaseUrl(props.pathname)} mode="edit" />

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
export default FactsEdit;
