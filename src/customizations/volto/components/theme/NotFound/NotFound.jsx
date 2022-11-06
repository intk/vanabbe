/**
 * Home container.
 * @module components/theme/NotFound/NotFound
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Container, Grid } from 'semantic-ui-react';
import { withServerErrorCode } from '@plone/volto/helpers/Utils/Utils';
import { BodyClass } from '@plone/volto/helpers';
import { Icon, UniversalLink } from '@plone/volto/components';
import { useSelector } from 'react-redux';
import config from '@plone/volto/registry';

import LogoImage from '@package/icons/logo.svg';
import image from '@package/static/404_img.png';

/**
 * Not found function.
 * @function NotFound
 * @returns {string} Markup of the not found page.
 */
const NotFound = (props) => {
  const { settings } = config;
  const lang = useSelector((state) => state.intl.locale);

  return (
    <Container className="view-wrapper">
      <BodyClass className="not-found-page" />
      <UniversalLink href={settings.isMultilingual ? `/${lang}` : '/'}>
        <Icon name={LogoImage} size="100px" color="#da281b" />
      </UniversalLink>
      <Grid>
        <Grid.Column computer={3} tablet={12}>
          <div>
            <h1 className="big-heading">
              <span className="small-heading">404 Error</span>
              Oops!
              {/* <FormattedMessage
                    id="This page does not seem to exist…"
                    defaultMessage="This page does not seem to exist…"
              /> */}
            </h1>
            <p>
              <FormattedMessage
                id="Something is broken, please try again later or go to home page."
                defaultMessage="Something is broken, please try again later or go to home page."
              />
            </p>
            <UniversalLink
              className="ui button secondary"
              href={settings.isMultilingual ? `/${lang}` : '/'}
            >
              <FormattedMessage
                id="Back to Home"
                defaultMessage="Back to Home"
              />
            </UniversalLink>
          </div>
        </Grid.Column>
        <Grid.Column computer={9} tablet={12}>
          <img
            height="auto"
            src={image}
            className="logo-partner"
            alt="404"
            title="404 Image"
          />
        </Grid.Column>
      </Grid>
      {/* <p className="description">
      <FormattedMessage
        id="We apologize for the inconvenience, but the page you were trying to access is not at this address. You can use the links below to help you find what you are looking for."
        defaultMessage="We apologize for the inconvenience, but the page you were trying to access is not at this address. You can use the links below to help you find what you are looking for."
      />
    </p>
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
    </p> */}
    </Container>
  );
};
export default withServerErrorCode(404)(NotFound);
