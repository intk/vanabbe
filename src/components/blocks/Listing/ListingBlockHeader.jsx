import { LinkMore } from '@plone/volto/components';

const ListingBlockHeader = ({ data, children, sliderView }) => {
  const { title, headline, linkHref, headlineTag } = data;
  const head = title || headline;
  const CustomTag = `${headlineTag || 'h2'}`;

  return head ? (
    <div className="listing-block-header">
      {headline && <CustomTag>{headline}</CustomTag>}
      {!sliderView && linkHref ? <LinkMore data={data} /> : ''}
      {children}
    </div>
  ) : (
    ''
  );
};

export default ListingBlockHeader;
