// Customizated for custom pagination and custom showNotFound

import React, { createRef } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Dimmer, Loader } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { usePrevious } from '@plone/volto/helpers';
import { useIsMounted } from '@package/helpers';
import Pagination from './LoadMorePagination';
import { useLocation } from 'react-router-dom';
import { compose } from 'redux';
import qs from 'querystring';
import { useDeepCompareMemoize } from 'use-deep-compare-effect';
import { dequal as deepEqual } from 'dequal';

import withQuerystringResults from './withQuerystringResults';

const ListingBodyComponent = (props) => {
  const {
    data = {},
    isEditMode,
    listingItems,
    totalPages,
    onPaginationChange,
    variation,
    currentPage,
    isFolderContentsListing,
    hasLoaded,
  } = props;

  const isMounted = useIsMounted();

  let ListingBodyTemplate;
  // Legacy support if template is present
  const variations = config.blocks?.blocksConfig['listing']?.variations || [];
  const defaultVariation = variations.filter((item) => item.isDefault)?.[0];

  if (data.template && !data.variation) {
    const legacyTemplateConfig = variations.find(
      (item) => item.id === data.template,
    );
    ListingBodyTemplate = legacyTemplateConfig.template;
  } else {
    ListingBodyTemplate =
      variation?.template ?? defaultVariation?.template ?? null;
  }

  const location = useLocation();
  const searchText = qs.parse(location.search.slice(1))['SearchableText'];
  const previousSearchText = usePrevious(searchText);
  const stableData = useDeepCompareMemoize(data);
  const previousData = usePrevious(stableData);

  const isChanged =
    previousSearchText !== searchText || !deepEqual(stableData, previousData);

  const [dataBuffer, setDataBuffer] = React.useState({
    currentPage,
    items: [...listingItems],
  });

  React.useEffect(() => {
    // the data buffer is reset whenever we change the query or search text
    if (isMounted() && isChanged) {
      setDataBuffer({ ...dataBuffer, items: [] });
    }
  }, [dataBuffer, listingItems, isChanged, isMounted]);

  const lastRecorded = dataBuffer.currentPage;
  const loadedItems = dataBuffer.items;

  // const noLoadedItems = listingItems && !loadedItems?.length;
  // React.useEffect(() => {
  //   if (isMounted() && noLoadedItems) {
  //     // console.log('rewrite loaded items');
  //     console.log('1');
  //     setDataBuffer({ ...dataBuffer, items: listingItems });
  //   }
  // }, [noLoadedItems, dataBuffer, listingItems, isMounted]);

  React.useEffect(() => {
    const loadedIds = loadedItems.map((item) => item['@id']);
    const otherItems = listingItems.filter(
      (item) => loadedIds.indexOf(item['@id']) === -1,
    );
    if (isMounted() && otherItems.length) {
      setDataBuffer({ currentPage, items: [...loadedItems, ...otherItems] });
    }
  }, [
    isMounted,
    currentPage,
    setDataBuffer,
    lastRecorded,
    loadedItems,
    listingItems,
  ]);

  const listingRef = createRef();

  return loadedItems?.length > 0 ? (
    <div ref={listingRef}>
      <ListingBodyTemplate
        items={loadedItems}
        isEditMode={isEditMode}
        {...data}
        {...variation}
      />
      {totalPages > 1 && (
        <div className="pagination-wrapper">
          <Pagination
            activePage={currentPage}
            totalPages={totalPages}
            onPageChange={(e, { activePage }) => {
              // !isEditMode &&
              //   listingRef.current.scrollIntoView({ behavior: 'smooth' });
              onPaginationChange(e, { activePage });
            }}
          />
        </div>
      )}
    </div>
  ) : isEditMode ? (
    <div className="listing message" ref={listingRef}>
      {isFolderContentsListing && (
        <FormattedMessage
          id="No items found in this container."
          defaultMessage="No items found in this container."
        />
      )}
      {hasLoaded && (
        <FormattedMessage
          id="No results found."
          defaultMessage="No results found."
        />
      )}
      <Dimmer active={!hasLoaded} inverted>
        <Loader indeterminate size="small">
          <FormattedMessage id="loading" defaultMessage="Loading" />
        </Loader>
      </Dimmer>
    </div>
  ) : (
    <div>
      {hasLoaded && data.showNotFound && (
        <FormattedMessage
          id="No results found."
          defaultMessage="No results found."
        />
      )}
      <Dimmer active={!hasLoaded} inverted>
        <Loader indeterminate size="small">
          <FormattedMessage id="loading" defaultMessage="Loading" />
        </Loader>
      </Dimmer>
    </div>
  );
};

const withSearchText = (WrappedComponent) => {
  function WithSearchText(props) {
    const location = useLocation();
    const searchText = qs.parse(location.search.slice(1))['SearchableText'];
    let data = props.data || {};

    if (searchText) {
      const { querystring = {} } = data;
      const { query = [] } = querystring;
      if (!query.find((op) => op.i === 'SearchableText')) {
        query.push({
          i: 'SearchableText',
          o: 'plone.app.querystring.operation.string.contains',
          v: searchText,
        });
      }
    }

    return <WrappedComponent {...props} key={searchText} />;
  }
  return WithSearchText;
};

export default compose(
  injectIntl,
  withSearchText,
  withQuerystringResults,
)(ListingBodyComponent);
