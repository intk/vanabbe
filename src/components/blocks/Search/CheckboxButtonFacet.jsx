import React from 'react';
import { Checkbox, Header } from 'semantic-ui-react';
import {
  selectFacetSchemaEnhancer,
  selectFacetStateToValue,
  selectFacetValueToQuery,
} from '@plone/volto/components/manage/Blocks/Search/components/base';

const CheckboxButtonFacet = (props) => {
  const { facet, choices, isMulti, onChange, value, isEditMode } = props;
  const facetValue = value;

  return (
    <div className="button-facet">
      <Header as="h4">{facet.title ?? facet?.field?.label}</Header>
      <div className="entries">
        {choices.map(({ label, value }, i) => (
          <div className="entry" key={value}>
            <Checkbox
              disabled={isEditMode}
              label={label}
              checked={!!facetValue?.find((f) => f.value === value)}
              onChange={(e, { checked }) =>
                onChange(
                  facet.field.value,
                  isMulti
                    ? [
                        ...facetValue
                          .filter((f) => f.value !== value)
                          .map((f) => f.value),
                        ...(checked ? [value] : []),
                      ]
                    : checked
                    ? value
                    : null,
                )
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

CheckboxButtonFacet.schemaEnhancer = selectFacetSchemaEnhancer;
CheckboxButtonFacet.stateToValue = selectFacetStateToValue;
CheckboxButtonFacet.valueToQuery = selectFacetValueToQuery;

export default CheckboxButtonFacet;
