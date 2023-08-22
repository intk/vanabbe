import { FormattedMessage } from 'react-intl';
import { Button } from 'semantic-ui-react';
import { Icon } from '@plone/volto/components';

import addSVG from '@plone/volto/icons/add.svg';

function LoadMorePagination(props) {
  const { activePage, totalPages, onPageChange } = props;

  return activePage < totalPages ? (
    <div className="pagination">
      <Button
        className="load-more"
        secondary
        onClick={(e) => onPageChange(e, { activePage: activePage + 1 })}
      >
        <FormattedMessage id="Load more " defaultMessage="Load more " />
        <Icon name={addSVG} size="25px" />
      </Button>
    </div>
  ) : null;
}
export default LoadMorePagination;
