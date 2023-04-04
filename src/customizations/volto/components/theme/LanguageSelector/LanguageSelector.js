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
  const translations = useSelector(
    (state) => state.content.data?.['@components']?.translations?.items,
  );

  const { settings } = config;

  return settings.isMultilingual ? (
    <div className="language-selector">
      <Dropdown
        direction="right"
        trigger={
          <span>
            <span>{capitalize(langmap[currentLang].nativeName)}</span>
          </span>
        }
      >
        <Dropdown.Menu>
          {map(settings.supportedLanguages, (lang) => {
            const translation = find(translations, { language: lang });
            return (
              <Dropdown.Item
                key={`language-selector-${lang}`}
                disabled={!translation}
              >
                <Link
                  aria-label={`${intl.formatMessage(
                    messages.switchLanguageTo,
                  )} ${langmap[lang].nativeName.toLowerCase()}`}
                  className={cx({ selected: lang === currentLang })}
                  to={
                    translation
                      ? flattenToAppURL(translation['@id'])
                      : `/${lang}`
                  }
                  title={langmap[lang].nativeName}
                  onClick={() => {
                    props.onClickAction();
                  }}
                  key={`language-selector-${lang}`}
                >
                  {langmap[lang].nativeName} ({lang})
                </Link>
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
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
