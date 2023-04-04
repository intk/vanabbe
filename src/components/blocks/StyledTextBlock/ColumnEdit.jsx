import React, { useState } from 'react';
import { isEmpty } from 'lodash';
import { BlocksForm } from '@plone/volto/components';
import { emptyBlocksForm } from '@plone/volto/helpers';
import PropTypes from 'prop-types';
import EditBlockWrapper from './EditBlockWrapper';
import './editor.less';

const Edit = (props) => {
  const {
    block,
    data,
    onChangeBlock,
    onChangeField,
    pathname,
    selected,
    manage,
    title = 'Section',
  } = props;

  const metadata = props.metadata || props.properties;
  const data_blocks = data?.data?.blocks;
  const properties = isEmpty(data_blocks) ? emptyBlocksForm() : data.data;

  const [selectedBlock, setSelectedBlock] = useState(
    properties.blocks_layout.items[0],
  );

  React.useEffect(() => {
    if (
      isEmpty(data_blocks) &&
      properties.blocks_layout.items[0] !== selectedBlock
    ) {
      setSelectedBlock(properties.blocks_layout.items[0]);
      onChangeBlock(block, {
        ...data,
        data: properties,
      });
    }
  }, [onChangeBlock, properties, selectedBlock, block, data, data_blocks]);

  const blockState = {};

  return (
    <fieldset className="section-block">
      <legend
        onClick={() => {
          setSelectedBlock();
          props.setSidebarTab(1);
        }}
        aria-hidden="true"
      >
        {title}
      </legend>
      <BlocksForm
        metadata={metadata}
        properties={properties}
        manage={manage}
        selectedBlock={selected ? selectedBlock : null}
        allowedBlocks={data.allowedBlocks}
        title={data.placeholder}
        onSelectBlock={(id) => {
          setSelectedBlock(id);
        }}
        onChangeFormData={(newFormData) => {
          onChangeBlock(block, {
            ...data,
            data: newFormData,
          });
        }}
        onChangeField={(id, value) => {
          if (['blocks', 'blocks_layout'].indexOf(id) > -1) {
            blockState[id] = value;
            onChangeBlock(block, {
              ...data,
              data: {
                ...data.data,
                ...blockState,
              },
            });
          } else {
            onChangeField(id, value);
          }
        }}
        pathname={pathname}
      >
        {({ draginfo }, editBlock, blockProps) => (
          <EditBlockWrapper draginfo={draginfo} blockProps={blockProps}>
            {editBlock}
          </EditBlockWrapper>
        )}
      </BlocksForm>
    </fieldset>
  );
};

Edit.propTypes = {
  block: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  onChangeBlock: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  manage: PropTypes.bool.isRequired,
};

export default Edit;
