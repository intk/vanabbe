import { LinkMore } from '@plone/volto/components';

const ListingBlockHeader = ({ data, children, sliderView }) => {
  const { title, headline, linkHref } = data;
  const head = title || headline;

  return head ? (
    <div className="listing-block-header">
      <h2>{head}</h2>
      {!sliderView && linkHref ? <LinkMore data={data} /> : ''}
      {children}
    </div>
  ) : (
    ''
  );
};

export default ListingBlockHeader;
