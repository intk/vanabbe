import { useDeepCompareMemoize } from 'use-deep-compare-effect';

export default function HiddenFacets(props) {
  const { data, facets } = props;

  const hiddenFacets = data?.facets?.filter(
    (f) => f.hidden && Object.keys(facets || {}).includes(f.field.value),
  );
  // const hiddenFacetFields = hiddenFacets.map((f) => f.field.value);

  // const hiddenActiveFacets = facets.keys().
  //   searchData.query?.filter((f) =>
  //   hiddenFacetFields.includes(f.i),
  // );
  // const activeFacets = useDeepCompareMemoize(hiddenFacets);
  //
  console.log('facets', facets, hiddenFacets);
  // console.log(props, { hiddenFacets, hiddenFacetFields, hiddenActiveFacets });
  return null;
}
