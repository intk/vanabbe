import React from 'react';
import { BlockDataForm, SidebarPortal, Icon } from '@plone/volto/components';
import { getBaseUrl } from '@plone/volto/helpers';
import { Message } from 'semantic-ui-react';
import SiteThemeView from './SiteThemeView';
import SiteThemeSchema from './schema';

import themeSVG from '@plone/volto/icons/theme.svg';

const SiteThemeEdit = (props) => {
  const { block, onChangeBlock, data = {}, selected } = props;
  const schema = SiteThemeSchema(props);

  return (
    <>
      <SiteThemeView {...props} path={getBaseUrl(props.pathname)} mode="edit" />
      <Message icon>
        <Icon name={themeSVG} size="22" />
        <Message.Content>
          {data.theme ? (
            <>Selected theme: {data.theme}</>
          ) : (
            <>Select page theme</>
          )}
        </Message.Content>
      </Message>

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
export default SiteThemeEdit;
