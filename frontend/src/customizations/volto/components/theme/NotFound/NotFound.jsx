/* eslint-disable no-unused-vars */
import { useEffect } from 'react';
import { BodyClass, toBackendLang } from '@plone/volto/helpers';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { withServerErrorCode } from '@plone/volto/helpers/Utils/Utils';
import { useDispatch, useSelector } from 'react-redux';
import { getNavigation } from '@plone/volto/actions';
import config from '@plone/volto/registry';
import { compose } from 'redux';

const translations = {
  apoligies: {
    en:
      'We apologize for the inconvenience, but the page you were trying to access is not at this address.',
    nl:
      'Onze excuses voor het ongemak, maar de pagina die je probeerde te bereiken bestaat niet.',
  },
};

/**
 * Not found function.
 * @function NotFound
 * @returns {string} Markup of the not found page.
 */
const NotFound = () => {
  const dispatch = useDispatch();
  const lang = useSelector((state) => state.intl.locale);

  useEffect(() => {
    dispatch(
      getNavigation(
        config.settings.isMultilingual ? `/${toBackendLang(lang)}` : '/',
        config.settings.navDepth,
      ),
    );
  }, [dispatch, lang]);

  return (
    <Container className="view-wrapper not-found">
      <BodyClass className="page-not-found" />
      <h1>
        <FormattedMessage
          id="This page does not seem to exist…"
          defaultMessage="This page does not seem to exist…"
        />
      </h1>
      <p className="description">{translations['apoligies'][lang]}</p>
      <p>
        <FormattedMessage
          id="If you are certain you have the correct web address but are encountering an error, please contact the {site_admin}."
          defaultMessage="If you are certain you have the correct web address but are encountering an error, please contact the {site_admin}."
          values={{
            site_admin: (
              <Link to="/contact-form">
                <FormattedMessage
                  id="Site Administration"
                  defaultMessage="Site Administration"
                />
              </Link>
            ),
          }}
        />
      </p>
      <p>
        <FormattedMessage id="Thank you." defaultMessage="Thank you." />
      </p>
    </Container>
  );
};

export default compose(NotFound);
