import TopFiltersLayout from './TopFiltersLayout';
import CheckboxButtonFacet from './CheckboxButtonFacet';
import { SelectFacetFilterListEntry } from '@plone/volto/components/manage/Blocks/Search/components';

export default function installSearchBlock(config) {
  config.blocks.blocksConfig.search = {
    ...config.blocks.blocksConfig.search,
    variations: [
      {
        id: 'facetsTopSide',
        title: 'Facets on top',
        view: TopFiltersLayout,
        isDefault: true,
      },
    ],
    extensions: {
      ...config.blocks.blocksConfig.search.extensions,
      facetWidgets: {
        ...config.blocks.blocksConfig.search.extensions.facetWidgets,
        types: [
          {
            id: 'checkboxButtonFacet',
            title: 'Button',
            view: CheckboxButtonFacet,
            isDefault: false,
            stateToValue: CheckboxButtonFacet.stateToValue,
            valueToQuery: CheckboxButtonFacet.valueToQuery,
            filterListComponent: SelectFacetFilterListEntry,
            schemaEnhancer: CheckboxButtonFacet.schemaEnhancer,
          },
          ...config.blocks.blocksConfig.search.extensions.facetWidgets.types,
        ],
      },
    },
  };

  return config;
}
