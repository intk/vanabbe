import { List } from 'semantic-ui-react';
import { useFooterContent } from '@package/helpers';

const SocialLinks = (props) => {
  const { hideTitle } = props;
  const footer = useFooterContent();
  const { blocks = {} } = footer;
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
              <List.Item>
                <List.Content>
                  <a key={`${l.href}-${i}`} href={l.href}>
                    {l.title}
                  </a>
                </List.Content>
              </List.Item>
            ))
          : null}
      </List>
    </div>
  );
};

export default SocialLinks;
