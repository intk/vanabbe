import React from 'react';

import { GroupBlockView } from '@eeacms/volto-group-block/components';
import { withBlockExtensions } from '@plone/volto/helpers';

import './view.less';

export const SmallText = (props) => (
  <div className="block smallText-wrapper">
    <GroupBlockView {...props} />
  </div>
);

const StyledTextBlockView = (props) => {
  const Template = props.variation?.template || SmallText;

  return <Template {...props} />;
};

export default withBlockExtensions(StyledTextBlockView);
