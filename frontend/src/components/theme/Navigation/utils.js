import _ from 'lodash';

export const isMouseOver = (node, e) => {
  // const contains = node && node.contains(e.target);
  // console.log('mouse out', contains, e);

  const { clientX, clientY } = e;
  if (_.some([clientX, clientY], _.isNil)) return false;

  // false if the node is not visible
  const clientRects = node.getClientRects();
  // Heads Up!
  // getClientRects returns a DOMRectList, not an array nor a plain object
  // We explicitly avoid _.isEmpty and check .length to cover all possible shapes
  if (
    !node.offsetWidth ||
    !node.offsetHeight ||
    !clientRects ||
    !clientRects.length
  )
    return false;

  // false if the node doesn't have a valid bounding rect
  const { top, bottom, left, right } = _.first(clientRects);
  if (_.some([top, bottom, left, right], _.isNil)) return false;

  // we add a small decimal to the upper bound just to make it inclusive
  // don't add an whole pixel (1) as the event/node values may be decimal sensitive
  return (
    _.inRange(clientY, top, bottom + 0.001) &&
    _.inRange(clientX, left, right + 0.001)
  );
};
