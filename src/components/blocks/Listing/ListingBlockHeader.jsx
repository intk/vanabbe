const ListingBlockHeader = ({ data }) => {
  const { title, headline, headlineTag } = data;
  const head = title || headline;
  const CustomTag = `${headlineTag || 'h2'}`;

  return head ? (
    <div className="listing-block-header">
      {headline && <CustomTag>{headline}</CustomTag>}
    </div>
  ) : (
    ''
  );
};

export default ListingBlockHeader;
