import React from 'react';
import { GroupBlockView } from '@eeacms/volto-group-block/components';
import { withBlockExtensions } from '@plone/volto/helpers';
import { Icon } from '@plone/volto/components';
import quoteSVG from '@plone/volto/icons/quote.svg';

import './view.less';

export const Simple = (props) => (
  <div className="block quoteBlock-wrapper">
    <GroupBlockView {...props} />
  </div>
);

export const Surrounded = (props) => (
  <div className="block quoteBlock-wrapper quoteBlock-quoteMarks">
    <div className="icon-wrapper top">
      <Icon name={quoteSVG} size="40px" />
    </div>
    <GroupBlockView {...props} />
    <div className="icon-wrapper bottom">
      <Icon name={quoteSVG} size="40px" />
    </div>
  </div>
);

const QuoteBlockView = (props) => {
  const Template = props.variation?.template || Simple;

  return <Template {...props} />;
};

export default withBlockExtensions(QuoteBlockView);
