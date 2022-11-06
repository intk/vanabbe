import React from 'react';

import { FormattedMessage, injectIntl } from 'react-intl'; // defineMessages
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { RenderBlocks, Icon as VoltoIcon } from '@plone/volto/components';

import defaultIcon from '@package/icons/link.svg';
import LogoImage from '@package/icons/logo.svg';
import FacebookLogo from '@package/static/facebook.svg';
import InstagramLogo from '@package/static/instagram.svg';
import TwitterLogo from '@package/static/twiter.svg';
import YouTubeLogo from '@package/static/youtube.svg';
import LinkedInLogo from '@package/static/linkedin.svg';
import twitchIcon from '@package/icons/twitch.svg';
import config from '@plone/volto/registry';

const Login = () => {
  const { settings } = config;
  const token = useSelector((state) => state.userSession?.token);
  const content = useSelector((state) => state.content?.data || {});

  return token ? (
    <Link aria-label="login" to="/logout">
      Logout
    </Link>
  ) : (
    <Link
      aria-label="login"
      to={`/login${
        content
          ? `?return_url=${(content['@id'] || '').replace(
              settings.apiPath,
              '',
            )}`
          : ''
      }`}
    >
      Log in
    </Link>
  );
};

const SocialLink = ({ href = '', title = '' }) => {
  const icon =
    href.indexOf('facebook') > -1
      ? FacebookLogo
      : href.indexOf('twitter') > -1
      ? TwitterLogo
      : href.indexOf('linkedin') > -1
      ? LinkedInLogo
      : href.indexOf('twitch') > -1
      ? twitchIcon
      : href.indexOf('instagram') > -1
      ? InstagramLogo
      : href.indexOf('youtube') > -1
      ? YouTubeLogo
      : defaultIcon;

  return (
    <a href={href}>
      <img
        height="auto"
        title={title}
        src={icon}
        alt={title}
        className="logo-social"
      />
    </a>
  );
};

export const SocialLinks = ({ socialLinks = [] }) =>
  socialLinks?.length
    ? socialLinks.map((l, i) => (
        <SocialLink key={`${l.href}-${i}`} href={l.href} title={l.title} />
      ))
    : 'No social links defined';

export const Address = ({ address, phone, email, openHours }) => (
  <ul className="footer-contact">
    {!!address && (
      <li>
        <Icon name="map marker alternate" size="small" />
        <p>{address}</p>
      </li>
    )}
    {!!phone && (
      <li>
        <Icon name="phone" size="small" />
        <p>
          <a href={`tel:${phone}`}>{phone}</a>
        </p>
      </li>
    )}
    {!!email && (
      <li>
        <Icon name="mail outline" size="small" />
        <p>
          <a href={`mailto:${email}`}>{email}</a>
        </p>
      </li>
    )}
    {!!openHours && (
      <li>
        <Icon name="clock outline" size="small" />
        <p>{openHours}</p>
      </li>
    )}
  </ul>
);

const NewsletterDetails = () => (
  <>
    {/* <p>
      <FormattedMessage
        id="joinOurMailing"
        defaultMessage="Join our mailing list to stay up to date on everything that happens at the park"
      />
    </p> */}
    <h3>
      <FormattedMessage id="Newsletter" defaultMessage="Newsletter" />
    </h3>
    <h2>
      <FormattedMessage
        id="Get Update Every Week"
        defaultMessage="Get Update Every Week"
      />
    </h2>
    <a className="ui button subscribe" href="/en/newsletter">
      <FormattedMessage id="Subscribe Now" defaultMessage="Subscribe Now" />
    </a>
  </>
);

const Copyright = () => (
  <p> © Copyright Animal Rights {new Date().getFullYear()}</p>
);

const useFooter = () => {
  const currentLang = useSelector((state) => state.intl.locale);
  const content = useSelector(
    (state) => state.content.subrequests?.[`footer-${currentLang}`]?.data || {},
  );

  return content;
};

const useFooterBlock = (globalId) => {
  const footer = useFooter();
  const { blocks = {} } = footer;
  // blocks[id]['@type'] === 'actionLinks' &&
  const blockId = Object.keys(blocks).find(
    (id) => blocks[id].globalId === globalId,
  );
  return blockId ? [blockId, blocks[blockId]] : [];
};

const FooterLinks = ({ globalId }) => {
  const [blockId, block] = useFooterBlock(globalId);
  const properties = {
    blocks: { [blockId]: block },
    blocks_layout: { items: [blockId] },
  };

  return blockId ? <RenderBlocks content={properties} /> : null;
};

const FooterImage = () => {
  const footer = useFooter();
  const { blocks = {} } = footer;
  const imageBlock = Object.values(blocks).filter(
    (id) => id['@type'] === 'image',
  );
  const url = imageBlock[0]?.url;

  return (
    <div
      className="footer-image"
      style={{
        backgroundImage: `url(${url}/@@images/image/)`,
      }}
    />
  );
};

export function Footer(props) {
  const footer = useFooter();
  const { blocks = {} } = footer;
  const id = Object.keys(blocks).find(
    (id) => blocks[id]?.['@type'] === 'siteData',
  );
  const siteData = blocks[id] || {};

  return (
    <>
      <div className="footer">
        <div className="footer-bottom-left">
          <FooterImage />
          <div className="footer-bottom-address">
            <div className="footer-logo">
              <VoltoIcon name={LogoImage} size="60px" color="#fff" />
            </div>
            <Address {...siteData} />
            <div className="footer-social">
              <SocialLinks {...siteData} />
            </div>
          </div>
        </div>

        <div className="footer-bottom-right">
          <div className="footer-subscribe">
            <NewsletterDetails />
            <div className="footer-extra">
              <FooterBlocks
                excludeIds={config.settings.actionBlockIds}
                excludeTypes={['title', 'actionLinks', 'image', 'siteData']}
              />
            </div>
          </div>

          <div className="links">
            <FooterLinks globalId="footerLinks" />
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="ui container">
          <Copyright />
          <div className="site-actions">
            <FooterLinks globalId="siteActions" />
            <Login />
          </div>
        </div>
      </div>
    </>
  );
}

export default injectIntl(Footer);

const FooterBlocks = ({
  excludeIds = [],
  excludeTypes = ['title', 'actionLinks', 'image', 'siteData'],
}) => {
  const footer = useFooter();
  const { blocks = {}, blocks_layout } = footer;
  // console.log('blocks', blocks, excludeTypes);
  const filtered = blocks_layout?.items?.filter(
    // TODO: filter by excludeIds
    (id) => !excludeTypes.includes(blocks[id]?.['@type']),
  );
  const properties = {
    blocks,
    blocks_layout: {
      ...blocks_layout,
      items: filtered,
    },
  };
  return <RenderBlocks content={properties} />;
};
