import { List } from 'semantic-ui-react';
import { useSiteDataContent } from '@package/helpers';

const SocialLinks = (props) => {
  const { hideTitle } = props;
  const siteDataContent = useSiteDataContent();
  const { blocks = {} } = siteDataContent;
  const siteDataId = Object.keys(blocks).find(
    (id) => blocks[id]?.['@type'] === 'siteData',
  );

  const siteData = blocks[siteDataId] || {};
  const { socialLinks, socialLinksTitle } = siteData;

  return (
    <div className="social-links">
      {!hideTitle && <div className="section-title">{socialLinksTitle}</div>}

      <List>
        {socialLinks?.length
          ? socialLinks.map((l, i) => (
              <List.Item key={i}>
                <List.Content>
                  <p key={`${l.href}-${i}`}>
                    <a href={l.href}>{l.title}</a>
                  </p>
                </List.Content>
              </List.Item>
            ))
          : null}
      </List>
    </div>
  );
};

export default SocialLinks;
