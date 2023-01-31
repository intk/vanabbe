import { useSelector } from 'react-redux';

const ListingBlockHeader = ({ data }) => {
  const { title, headline, headlineTag, block } = data;
  const head = title || headline;
  const CustomTag = `${headlineTag || 'h2'}`;

  const total = useSelector(
    (state) => state.querystringsearch.subrequests?.[block]?.total,
  );
  console.log(total);

  return head ? (
    <div className="listing-block-header">
      {headline && (
        <CustomTag>
          {headline}
          {data.showCount && total ? ` (${total})` : ''}
        </CustomTag>
      )}
    </div>
  ) : (
    ''
  );
};

export default ListingBlockHeader;
