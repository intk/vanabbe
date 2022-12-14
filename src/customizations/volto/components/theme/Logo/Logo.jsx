/**
 * Logo component.
 * @module components/theme/Logo/Logo
 */

import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import config from '@plone/volto/registry';
import { UniversalLink, Icon } from '@plone/volto/components';
import logoImage from '../../../../../icons/vanabbe.svg';

const messages = defineMessages({
  site: {
    id: 'Go to the homepage of Van Abbemuseum',
    defaultMessage: 'Go to the homepage of Van Abbemuseum',
  },
});

/**
 * Logo component class.
 * @function Logo
 * @param {Object} intl Intl object
 * @returns {string} Markup of the component.
 */
const Logo = (props) => {
  const { size = '80px' } = props;
  const { settings } = config;
  const lang = useSelector((state) => state.intl.locale);
  const intl = useIntl();

  return (
    <div className="logo">
      <UniversalLink
        href={settings.isMultilingual ? `/${lang}` : '/'}
        title={intl.formatMessage(messages.site)}
      >
        <Icon name={logoImage} size={size} />
      </UniversalLink>
    </div>
  );
};

export default Logo;
