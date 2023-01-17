import { useSiteDataContent } from '@package/helpers';

const OpeningHours = () => {
  const siteDataContent = useSiteDataContent();
  const { blocks = {} } = siteDataContent;
  const siteDataId = Object.keys(blocks).find(
    (id) => blocks[id]?.['@type'] === 'siteData',
  );
  const siteData = blocks[siteDataId] || {};
  const { openingHours, openingHoursTitle } = siteData;

  return (
    <div className="open-hours">
      <div>{openingHoursTitle}</div>
      <div>{openingHours}</div>
    </div>
  );
};

export default OpeningHours;
