import { useLocation } from 'react-router-dom';
import qs from 'querystring';
import { useSelector } from 'react-redux';
import { BodyClass, getBlocks } from '@plone/volto/helpers';
import { FormattedMessage } from 'react-intl';

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
    <div className="search-overview">
      <BodyClass className="has-search-overview" />

      <h1>
        {total > 0 ? (
          <>
            <FormattedMessage
              id="Showing results for ''{searchText}''"
              defaultMessage="Showing results for ''{searchText}''"
              values={{
                em: (...chunks) => <em>{chunks}</em>,
                searchText: searchText,
              }}
            />{' '}
            ({total})
          </>
        ) : (
          <FormattedMessage
            id="No results for ''{searchText}''"
            defaultMessage="No results for ''{searchText}''"
            values={{
              em: (...chunks) => <em>{chunks}</em>,
              searchText: searchText,
            }}
          />
        )}
      </h1>

      {total === 0 && (
        <h3>
          <FormattedMessage
            id="Make sure all words are spelled correctly. Try different or more general search terms."
            defaultMessage="Make sure all words are spelled correctly. Try different or more general search terms."
          />
        </h3>
      )}
    </div>
  ) : null;
}
export default SearchOverviewView;
