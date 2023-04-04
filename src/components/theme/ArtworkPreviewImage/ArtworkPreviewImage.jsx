import React from 'react';
import { Logo } from '@plone/volto/components';
import { PreviewImage } from '@package/components';

const ArtworkPreviewImage = (props) => {
  const { item, size, itemAuthor, itemTitle, isFallback = false } = props;

  return isFallback ? (
    <div className="artwork-fallback-image">
      <Logo height="165px" />
      <div className="item-meta">
        {!!itemTitle && <h3 className="item-title">{itemTitle}</h3>}
        {!!itemAuthor && <p>{itemAuthor}</p>}
      </div>
    </div>
  ) : (
    <PreviewImage item={item} size={size} />
  );
};

export default ArtworkPreviewImage;
