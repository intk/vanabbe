import { useFooterContent } from '@package/helpers';

const OpenHours = () => {
  const footer = useFooterContent();
  const { blocks = {} } = footer;
  const siteDataId = Object.keys(blocks).find(
    (id) => blocks[id]?.['@type'] === 'siteData',
  );
  const siteData = blocks[siteDataId] || {};
  const { openHours, openHoursTitle } = siteData;

  return (
    <div className="open-hours">
      <div>{openHoursTitle}</div>
      <div>{openHours}</div>
    </div>
  );
};

export default OpenHours;
