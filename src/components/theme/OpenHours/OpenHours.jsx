import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  open: {
    id: 'Morgen open',
    defaultMessage: 'Morgen open',
  },
});

const OpenHours = () => {
  const intl = useIntl();

  return (
    <div className="open-hours">
      <div>{intl.formatMessage(messages.open)}</div>
      <div>11u - 20u</div>
    </div>
  );
};

export default OpenHours;
