// To import an author:
// http://localhost:8080/Plone/nl/archief/@@import_vubis?import=artwork&max=10&query=authorName=Douglas

import loadable from '@loadable/component';
import config from '@plone/volto/registry';
import { Card } from '@package/components';

const Masonry = loadable(() => import('react-masonry-css'));

const getUrl = (info, content) => info['url'];

// case 'artwork':
//   label = `More artworks by ${content.authorName}`;
//   break;
// TODO: this makes no sense for an artist
// case 'collection':
//   label = `More artworks from this period`;
//   break;

const getLinkLabel = (infoId, content) => {
  let label;
  switch (infoId) {
    case 'publication':
      label = `Literature by or about ${content.authorName}`;
      break;
    case 'exhibition':
      label = `Exhibitions with ${content.authorName}`;
      break;
    default:
      break;
  }
  return label;
};

const getItem = (info, content) => {
  const item = {
    '@id': getUrl(info, content),
    title: getLinkLabel(info.id, content),
  };
  return item;
};

export default function AuthorView(props) {
  const { breakpointColumnsObj } = config.settings;
  const { content } = props;
  const components = content['@components'] || {};
  const { contextLinks = {} } = components;

  const artworks =
    contextLinks.items?.find(({ id }) => id === 'artworks')?.items || [];

  // TODO: format the AuthorBio
  console.log(content);
  return (
    <div>
      {content.AuthorBio}
      <h2>Artworks ({artworks.length})</h2>
      <div className="masonry-layout-listing">
        <div className="listings">
          <div className="listings ">
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="masonry-grid"
              columnClassName="masonry-grid_column"
            >
              {artworks.map((item, i) => (
                <div className="listing-column" key={i}>
                  <Card item={item} {...props} />
                </div>
              ))}
            </Masonry>
          </div>
        </div>
      </div>

      <h2>Context</h2>
      {contextLinks.items?.map((info) => {
        if (info.id === 'artworks') return null;

        const item = {
          ...getItem(info, content),
          image_field: 'image',
        };

        return (
          <Card
            key={info.id}
            id={info.id}
            item={item}
            {...props}
            useFallbackImage
          />
        );
      })}
    </div>
  );
}
