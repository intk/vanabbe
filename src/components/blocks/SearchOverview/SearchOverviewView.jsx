import { useLocation } from 'react-router-dom';
import qs from 'querystring';
import { useSelector } from 'react-redux';
import { BodyClass, getBlocks } from '@plone/volto/helpers';
import { FormattedMessage } from 'react-intl';
import { Button } from 'semantic-ui-react';

import addSVG from '@plone/volto/icons/add.svg';

function SearchOverviewView(props) {
  const blocks = useSelector((state) => {
    const { content, querystringsearch = {} } = state;
    const { data = {} } = content;
    const blocks = data?.blocks_layout ? getBlocks(data) : [];
    const blockIds = blocks.map(([blockId]) => blockId);
    const { subrequests = {} } = querystringsearch;
    return blockIds
      .filter((id) => Object.keys(subrequests).indexOf(id) > -1)
      .map((id) => [id, data.blocks?.[id], subrequests?.[id]?.total]);
  });

  const total = blocks.reduce((allTotal, block) => block[2] + allTotal, 0);

  const location = useLocation();
  const searchText = qs.parse(location.search.slice(1))['SearchableText'];

  return searchText ? (
    <div className="search-overview">
      <BodyClass className="has-search-overview" />

      <h1>
        {total > 0 ? (
          <>
            <FormattedMessage
              id="show.results"
              defaultMessage="Showing results for <u>something</u>"
              values={{
                u: (chunks) => <u>{searchText}</u>,
              }}
            />{' '}
            ({total})
          </>
        ) : (
          <FormattedMessage
            id="no.results"
            defaultMessage="No results for <u>something</u>"
            values={{
              u: (chunks) => <u>{searchText}</u>,
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

      <div className="navigator">
        <Button className="load-more" secondary as="a" onClick={() => {}}>
          {`All (${total})`}
        </Button>

        {blocks
          .filter(([, , total]) => total > 0)
          .map(([id, block, total]) => (
            <Button
              key={id}
              className="load-more"
              secondary
              as="a"
              href={`#${id}`}
            >
              {`${block.headline} (${total})`}
            </Button>
          ))}
      </div>
    </div>
  ) : null;
}
export default SearchOverviewView;
