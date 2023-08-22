import React from 'react';
import { Icon } from '@plone/volto/components';
import { Message, Divider, Header } from 'semantic-ui-react';
import { defineMessages, useIntl } from 'react-intl';

import upSVG from '@plone/volto/icons/up.svg';
import downSVG from '@plone/volto/icons/down.svg';

const messages = defineMessages({
  whiteBG: {
    id: 'White background applied before this divider',
    defaultMessage: 'White background applied before this divider',
  },
  noBG: {
    id: 'No background applied after this divider',
    defaultMessage: 'No background applied after this divider',
  },
});

const ContentDividerEdit = (props) => {
  const intl = useIntl();

  return (
    <Message info icon>
      <Message.Content>
        <Header as="h6">
          <Icon name={upSVG} size="22" />
          {intl.formatMessage(messages.whiteBG)}
        </Header>
        <Divider />
        <Header as="h6">
          <Icon name={downSVG} size="22" />
          {intl.formatMessage(messages.noBG)}
        </Header>
      </Message.Content>
    </Message>
  );
};
export default ContentDividerEdit;
