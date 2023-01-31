import { Button } from 'semantic-ui-react';

function LoadMorePagination(props) {
  const { activePage, totalPages, onPageChange } = props;

  return activePage < totalPages ? (
    <div className="pagination">
      <Button onClick={(e) => onPageChange(e, { activePage: activePage + 1 })}>
        Load more
      </Button>
    </div>
  ) : null;
}
export default LoadMorePagination;
