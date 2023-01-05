import { useFooterContent } from '@package/helpers';

const OpeningHours = () => {
  const footer = useFooterContent();
  const { blocks = {} } = footer;
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
