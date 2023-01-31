import { useLocation } from 'react-router-dom';
import qs from 'querystring';
import { useSelector } from 'react-redux';
import { getBlocks } from '@plone/volto/helpers';

function SearchOverviewView(props) {
  const total = useSelector((state) => {
    const { content, querystringsearch = {} } = state;
    const { data = {} } = content;
    const blocks = getBlocks(data);
    const blockIds = blocks.map(([blockId]) => blockId);
    const { subrequests = {} } = querystringsearch;
    return blockIds.reduce(
      (total, blockId) => total + (subrequests?.[blockId]?.total || 0),
      0,
    );
  });

  const location = useLocation();
  const searchText = qs.parse(location.search.slice(1))['SearchableText'];

  return searchText ? (
    <div>
      {total > 0
        ? `Showing results for "${searchText}" (${total})`
        : `No results for "${searchText}"`}
    </div>
  ) : null;
}
export default SearchOverviewView;
