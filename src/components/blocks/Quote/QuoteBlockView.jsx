import React from 'react';
import { GroupBlockView } from '@eeacms/volto-group-block/components';
import { withBlockExtensions } from '@plone/volto/helpers';

import './view.less';

export const Simple = (props) => (
  <div className="quoteBlock-wrapper">
    <GroupBlockView {...props} />
  </div>
);

// const QuoteOpen = () => (
//   <svg
//     width="1556"
//     height="85"
//     viewBox="0 0 1556 85"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <line y1="43.5" x2="1556" y2="43.5" stroke="#045454" />
//     <path
//       d="M790.031 22.2656H780.422V12.6562C780.422 8.5625 781.234 5.28125 782.859 2.8125C784.484 0.34375 786.875 -0.890625 790.031 -0.890625V3.60938C786.906 3.60938 785.344 6.625 785.344 12.6562H790.031V22.2656ZM775.547 22.2656H765.938V12.6562C765.938 8.5625 766.75 5.28125 768.375 2.8125C770 0.34375 772.391 -0.890625 775.547 -0.890625V3.60938C772.391 3.60938 770.812 6.625 770.812 12.6562H775.547V22.2656Z"
//       fill="#045454"
//     />
//   </svg>
// );
//
// const QuoteClose = () => (
//   <svg
//     width="1556"
//     height="85"
//     viewBox="0 0 1556 85"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <line x1="1556" y1="41.4999" x2="4.37115e-08" y2="41.5" stroke="#045454" />
//     <path
//       d="M765.969 62.7343L775.578 62.7343L775.578 72.3437C775.578 76.4374 774.766 79.7187 773.141 82.1874C771.516 84.6562 769.125 85.8906 765.969 85.8906L765.969 81.3906C769.094 81.3906 770.656 78.3749 770.656 72.3437L765.969 72.3437L765.969 62.7343ZM780.453 62.7343L790.062 62.7343L790.062 72.3437C790.062 76.4374 789.25 79.7187 787.625 82.1874C786 84.6562 783.609 85.8905 780.453 85.8905L780.453 81.3905C783.609 81.3905 785.187 78.3749 785.187 72.3437L780.453 72.3437L780.453 62.7343Z"
//       fill="#045454"
//     />
//   </svg>
// );

export const Surrounded = (props) => (
  <div className="quoteBlock-wrapper quoteBlock-quoteMarks">
    {/* <QuoteOpen /> */}
    <GroupBlockView {...props} />
    {/* <QuoteClose /> */}
  </div>
);

const QuoteBlockView = (props) => {
  const Template = props.variation?.template || Simple;

  return <Template {...props} />;
};

export default withBlockExtensions(QuoteBlockView);
