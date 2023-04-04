/**
 * Logo component.
 * @module components/theme/Logo/Logo
 */

import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import config from '@plone/volto/registry';
import { UniversalLink, Icon } from '@plone/volto/components';
import logoImage from '../../../../../icons/vanabbe.svg';

/**
 * Logo component class.
 * @function Logo
 * @param {Object} intl Intl object
 * @returns {string} Markup of the component.
 */
const Logo = (props) => {
  const { height = '80px', hasLink } = props;
  const { settings } = config;
  const lang = useSelector((state) => state.intl.locale);
  const intl = useIntl();

  return (
    <div className="logo">
      {hasLink ? (
        <UniversalLink
          href={settings.isMultilingual ? `/${lang}` : '/'}
          title={intl.formatMessage({
            id: 'Go to the homepage of Van Abbemuseum',
            defaultMessage: 'Go to the homepage of Van Abbemuseum',
          })}
        >
          <Icon name={logoImage} size={height} />
        </UniversalLink>
      ) : (
        <Icon name={logoImage} size={height} />
      )}
    </div>
  );
};

export default Logo;
