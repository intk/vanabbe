import { useIntl, defineMessages } from 'react-intl';
import { Popup } from 'semantic-ui-react';
import { Icon } from '@plone/volto/components';

import icon from './icons/readspeaker.svg';

const messages = defineMessages({
  underConstruction: {
    id: 'Under construction',
    defaultMessage: 'Under construction',
  },
});

export default function AccessibilityHelper(props) {
  const intl = useIntl();

  return (
    <Popup
      content={intl.formatMessage(messages.underConstruction)}
      trigger={<Icon name={icon} ariaRole="button" size="24px" />}
    />
  );
}
