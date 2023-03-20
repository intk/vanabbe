import React from 'react';
import { Checkbox, Header } from 'semantic-ui-react';

const ToggleSingleValueFacet = (props) => {
  const { facet, isEditMode, onChange, value } = props; // value, choices, isMulti, onChange,
  const label = value.value; // TODO: what to do about this?

  return (
    <div className="button-facet">
      <Header as="h4">{facet?.title ?? facet?.field?.label}</Header>
      <div className="radio">
        <Checkbox
          disabled={isEditMode}
          label={label}
          checked={true}
          onChange={(e, { checked }) => {
            onChange(facet.field.value, checked ? value : null);
          }}
        />
      </div>
    </div>
  );
};

ToggleSingleValueFacet.stateToValue = ({
  facetSettings,
  index,
  selectedValue,
}) => {
  return selectedValue || typeof selectedValue === 'string';
};

ToggleSingleValueFacet.valueToQuery = ({ value, facet }) => {
  return value
    ? {
        i: facet.field.value,
        o: 'plone.app.querystring.operation.selection.is',
        v: value,
      }
    : null;
};

export default ToggleSingleValueFacet;
