import TopFiltersLayout from './TopFiltersLayout';

export default function installSearchBlock(config) {
  config.blocks.blocksConfig.search.variations = [
    {
      id: 'facetsTopSide',
      title: 'Facets on top',
      view: TopFiltersLayout,
      isDefault: true,
    },
  ];
  return config;
}
