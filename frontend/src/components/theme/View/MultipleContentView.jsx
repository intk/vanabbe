import React from 'react';
import { DefaultView } from '@plone/volto/components';
import { BodyClass } from '@plone/volto/helpers';

const MultipleContentView = (props) => {
  return (
    <BodyClass className="multiple-content-view">
      <DefaultView {...props} />
    </BodyClass>
  );
};

export default MultipleContentView;
