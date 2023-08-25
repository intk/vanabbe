/**
 * Language selector component.
 * @module components/LanguageSelector/LanguageSelector
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { defineMessages, useIntl } from 'react-intl';
import { Dropdown } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import { find, map } from 'lodash';
import cx from 'classnames';
import { Helmet, langmap, flattenToAppURL } from '@plone/volto/helpers';
import { capitalize } from '@package/utils';

import config from '@plone/volto/registry';

const messages = defineMessages({
  switchLanguageTo: {
    id: 'Switch to',
    defaultMessage: 'Switch to',
  },
});

const LanguageSelector = (props) => {
  const intl = useIntl();
  const currentLang = useSelector((state) => state.intl.locale);
  const otherLang = currentLang === 'nl' ? 'en' : 'nl';
  const translations = useSelector(
    (state) => state.content.data?.['@components']?.translations?.items,
  );

  const { settings } = config;
  const translation = find(translations, { language: otherLang });

  return settings.isMultilingual ? (
    <div className="language-selector">
      <div>
        <span>
          <Link
            aria-label={`${intl.formatMessage(
              messages.switchLanguageTo,
            )} ${langmap[otherLang].nativeName.toLowerCase()}`}
            className={cx({ selected: otherLang === currentLang })}
            to={
              translation
                ? flattenToAppURL(translation['@id'])
                : `/${otherLang}`
            }
            onClick={() => {
              props.onClickAction();
            }}
            key={`language-selector-${otherLang}`}
          >
            {capitalize(langmap[otherLang].nativeName)}
          </Link>
        </span>
      </div>
    </div>
  ) : (
    <Helmet>
      <html lang={settings.defaultLanguage} />
    </Helmet>
  );
};

LanguageSelector.propTypes = {
  onClickAction: PropTypes.func,
};

LanguageSelector.defaultProps = {
  onClickAction: () => {},
};

export default LanguageSelector;
