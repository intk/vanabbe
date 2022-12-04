import installFactsBlock from './Facts';
import installActionLinks from './ActionLinks';
import installButtonBlock from './Button';
import installImageBlock from './Image';
import installImageCards from './ImageCards';
import installListingBlock from './Listing';
import installQuoteBlock from './Quote';
import installSiteDataBlock from './SiteData';
import installSiteThemeBlock from './SiteTheme';

import HeroView from './Hero/HeroView';
import { compose } from 'redux';

const installBlocks = (config) => {
  config.blocks.blocksConfig.hero.view = HeroView;

  return compose(
    installListingBlock,
    installImageBlock,
    installFactsBlock,
    installQuoteBlock,
    installImageCards,
    installButtonBlock,
    installActionLinks,
    installSiteDataBlock,
    installSiteThemeBlock,
  )(config);
};

export default installBlocks;
