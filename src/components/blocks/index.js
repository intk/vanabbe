import { compose } from 'redux';

// import installFactsBlock from './Facts';
import installActionLinksBlock from './ActionLinks';
import installButtonBlock from './Button';
import installImageBlock from './Image';
import installImageCards from './ImageCards';
import installListingBlock from './Listing';
import installQuoteBlock from './Quote';
import installSiteDataBlock from './SiteData';
import installSiteThemeBlock from './SiteTheme';
import installContentDividerBlock from './ContentDivider';
import installHeroUnitBlock from './HeroUnit';
import installInformationBlock from './Information';
import installVoltoFormBlock from './VoltoFormBlock';
import installSearchOverviewBlock from './SearchOverview';

import HeroView from './Hero/HeroView';

import addSVG from '@plone/volto/icons/add.svg';
import removeSVG from '@plone/volto/icons/remove.svg';

const installBlocks = (config) => {
  config.blocks.blocksConfig.hero.view = HeroView;

  config.blocks.blocksConfig.accordion = {
    ...config.blocks.blocksConfig.accordion,
    titleIcons: {
      closed: { leftPosition: addSVG, rightPosition: addSVG },
      opened: { leftPosition: removeSVG, rightPosition: removeSVG },
    },
  };

  return compose(
    installListingBlock,
    installImageBlock,
    installQuoteBlock,
    installImageCards,
    installButtonBlock,
    installActionLinksBlock,
    installSiteDataBlock,
    installSiteThemeBlock,
    installContentDividerBlock,
    installHeroUnitBlock,
    installInformationBlock,
    installVoltoFormBlock,
    installSearchOverviewBlock,
  )(config);
};

export default installBlocks;
