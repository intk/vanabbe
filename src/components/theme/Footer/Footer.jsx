import React from 'react';

import { FormattedMessage, injectIntl } from 'react-intl'; // defineMessages
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, List } from 'semantic-ui-react';
import { RenderBlocks } from '@plone/volto/components';
import { SocialLinks } from '@package/components';
import { useSiteDataContent } from '@package/helpers';

import config from '@plone/volto/registry';

const Login = () => {
  const { settings } = config;
  const token = useSelector((state) => state.userSession?.token);
  const content = useSelector((state) => state.content?.data || {});

  return token ? (
    <Link className="login" aria-label="login" to="/logout">
      <FormattedMessage id="Logout" defaultMessage="Logout" />
    </Link>
  ) : (
    <Link
      className="login"
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
      <FormattedMessage id="Log in" defaultMessage="Log in" />
    </Link>
  );
};

export const Address = ({ contactTitle, address, phone, email }) => (
  <div>
    <div className="section-title">{contactTitle}</div>
    <List className="footer-contact">
      <List.Item>
        <List.Content>{!!address && <p>{address}</p>}</List.Content>
      </List.Item>

      <List.Item>
        <List.Content>
          {!!phone && (
            <p>
              <a href={`tel:${phone}`}>{phone}</a>
            </p>
          )}
        </List.Content>
      </List.Item>

      <List.Item>
        <List.Content>
          {!!email && (
            <p>
              <a className="email" href={`mailto:${email}`}>
                {email}
              </a>
            </p>
          )}
        </List.Content>
      </List.Item>
    </List>
  </div>
);

// const useFooterBlock = (globalId) => {
//   const footer = useFooterContent();
//   const { blocks = {} } = footer;
//   const blockId = Object.keys(blocks).find(
//     (id) => blocks[id].globalId === globalId,
//   );
//   return blockId ? [blockId, blocks[blockId]] : [];
// };

// const FooterLinks = ({ globalId }) => {
//   const [blockId, block] = useFooterBlock(globalId);
//   const properties = {
//     blocks: { [blockId]: block },
//     blocks_layout: { items: [blockId] },
//   };

//   return blockId ? <RenderBlocks content={properties} /> : null;
// };

const FooterBlocks = ({ includeTypes }) => {
  const siteDataContent = useSiteDataContent();
  const { blocks = {}, blocks_layout } = siteDataContent;
  const filtered = blocks_layout?.items?.filter((id) =>
    includeTypes.includes(blocks[id]?.['@type']),
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

export function Footer(props) {
  const siteDataContent = useSiteDataContent();
  const { blocks = {} } = siteDataContent;
  const siteDataId = Object.keys(blocks).find(
    (id) => blocks[id]?.['@type'] === 'siteData',
  );

  const siteData = blocks[siteDataId] || {};

  return (
    <div className="footer">
      <Container>
        <div className="footer-wrapper offset-2-right">
          <SocialLinks {...siteData} />
          <Address {...siteData} />
          <FooterBlocks includeTypes={['actionLinks']} />

          {/* <FooterLinks globalId="footerLinks" /> */}
          {/* <FooterLinks globalId="siteActions" />  */}
          {/* <FooterBlocks
          excludeIds={config.settings.actionBlockIds}
          excludeTypes={['title', 'actionLinks', 'image', 'siteData']}
        /> */}
        </div>
        <Login />
      </Container>
    </div>
  );
}

export default injectIntl(Footer);

// const FooterBlocks = ({
//   excludeIds = [],
//   excludeTypes = ['title', 'actionLinks', 'image', 'siteData'],
// }) => {
//   const footer = useFooterContent();
//   const { blocks = {}, blocks_layout } = footer;
//   // console.log('blocks', blocks, excludeTypes);
//   const filtered = blocks_layout?.items?.filter(
//     // TODO: filter by excludeIds
//     (id) => !excludeTypes.includes(blocks[id]?.['@type']),
//   );
//   const properties = {
//     blocks,
//     blocks_layout: {
//       ...blocks_layout,
//       items: filtered,
//     },
//   };
//   return <RenderBlocks content={properties} />;
// };
