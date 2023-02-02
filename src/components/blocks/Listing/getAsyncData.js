import { getQueryStringResults } from '@plone/volto/actions';
import { resolveBlockExtensions } from '@plone/volto/helpers';
import qs from 'querystring';

export default ({ dispatch, data, path, blocksConfig, store }) => {
  const { resolvedExtensions } = resolveBlockExtensions(data, blocksConfig);
  // console.log('rest', rest);
  const state = store.getState();
  const { location } = state.router;
  // console.log(state.router.location.search);

  const searchText = qs.parse(location.search.slice(1))['SearchableText'];

  const { querystring = {} } = data;
  if (searchText) {
    const { query = [] } = querystring;
    if (!query.find((op) => op.i === 'SearchableText')) {
      query.push({
        i: 'SearchableText',
        o: 'plone.app.querystring.operation.string.contains',
        v: searchText,
      });
    }
  }

  const reqQuery = {
    ...data.querystring,
    ...(resolvedExtensions?.variation?.fullobjects
      ? { fullobjects: 1 }
      : { metadata_fields: '_all' }),
  };

  return [dispatch(getQueryStringResults(path, reqQuery, data.block))];
};
