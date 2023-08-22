import { useSiteDataContent } from '@package/helpers';
import { UniversalLink } from '@plone/volto/components';

const HeaderButton = () => {
  const siteDataContent = useSiteDataContent();
  const { blocks = {} } = siteDataContent;
  const siteDataId = Object.keys(blocks).find(
    (id) => blocks[id]?.['@type'] === 'siteData',
  );
  const siteData = blocks[siteDataId] || {};
  const { buttonTitle = 'Tickets', buttonHref } = siteData;

  let href = buttonHref?.[0]?.['@id'] || '';

  return buttonTitle || href ? (
    <>
      <UniversalLink
        href={href}
        className="ui button primary"
        target="_blank"
        title={buttonTitle}
      >
        {buttonTitle || href}
      </UniversalLink>
    </>
  ) : null;
};

export default HeaderButton;
