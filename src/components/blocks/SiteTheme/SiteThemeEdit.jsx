import React from 'react';
import { BlockDataForm, SidebarPortal, Icon } from '@plone/volto/components';
import { getBaseUrl } from '@plone/volto/helpers';
import { defineMessages, useIntl } from 'react-intl';
import { Message, Header } from 'semantic-ui-react';
import SiteThemeView from './SiteThemeView';
import SiteThemeSchema from './schema';

import themeSVG from '@plone/volto/icons/theme.svg';

const messages = defineMessages({
  selectedTheme: {
    id: 'Selected theme',
    defaultMessage: 'Selected theme',
  },
  selectTheme: {
    id: 'Select page theme',
    defaultMessage: 'Select page theme',
  },
});

const SiteThemeEdit = (props) => {
  const intl = useIntl();
  const { block, onChangeBlock, data = {}, selected } = props;
  const schema = SiteThemeSchema(props);

  return (
    <>
      <SiteThemeView
        {...props}
        path={getBaseUrl(props.pathname)}
        mode="edit"
        selected={selected}
      />
      <Message icon info>
        <Message.Content>
          <Header as="h6">
            <Icon name={themeSVG} size="22" />
            {data.theme ? (
              <>
                {intl.formatMessage(messages.selectedTheme)}: {data.theme}
              </>
            ) : (
              <>{intl.formatMessage(messages.selectTheme)}</>
            )}
          </Header>
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
