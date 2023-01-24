import ListingsBlockTemplate from './ListingTemplate';
import SliderListingBlockTemplate from './SliderListing';
import BigCardsTemplate from './BigCardsTemplate';
import AgendaListingTemplate from './AgendaListing';
import ColoredCardsTemplate from './ColoredCardsTemplate';
import SearchListingTemplate from './SearchListingTemplate';

export default (config) => {
  config.blocks.blocksConfig.listing.schemaEnhancer = ({ schema }) => {
    // move querystring to its own fieldset;
    schema.fieldsets[0].fields = schema.fieldsets[0].fields.filter(
      (f) => f !== 'querystring',
    );
    schema.fieldsets.splice(1, 0, {
      id: 'querystring',
      title: 'Query',
      fields: ['querystring'],
    });

    schema.properties = {
      ...schema.properties,
      linkTitle: {
        title: 'Button title',
      },
      linkHref: {
        title: 'Call to action',
        widget: 'object_browser',
        mode: 'link',
        selectedItemAttrs: ['Title', 'Description'],
        allowExternals: true,
      },
      showDate: {
        title: 'Show date',
        type: 'boolean',
        default: true,
      },
    };

    schema.fieldsets[0].fields.splice(
      2,
      0,
      'linkHref',
      'linkTitle',
      'showDate',
    );

    return schema;
  };

  config.blocks.blocksConfig.listing.variations = [
    // ...config.blocks.blocksConfig.listing.variations,

    {
      id: 'listings',
      isDefault: true,
      title: 'Cards',
      template: ListingsBlockTemplate,
    },
    {
      id: 'listing_big_cards',
      isDefault: true,
      title: 'Big cards',
      template: BigCardsTemplate,
    },
    {
      id: 'agenda',
      isDefault: false,
      title: 'Agenda',
      template: AgendaListingTemplate,
    },
    {
      id: 'coloredCards',
      isDefault: false,
      title: 'Colored cards',
      template: ColoredCardsTemplate,
    },
    {
      id: 'search_listing',
      isDefault: false,
      title: 'Search listing',
      template: SearchListingTemplate,
    },
    {
      id: 'slider_listing',
      isDefault: false,
      title: 'Slider',
      template: SliderListingBlockTemplate,
    },
  ];

  // config.blocks.blocksConfig.listing.variations[0].isDefault = false;

  return config;
};
