// To import an author:
// http://localhost:8080/Plone/nl/archief/@@import_vubis?import=artwork&max=10&query=authorName=Douglas
import React from 'react';
import { Portal } from 'react-portal';
import loadable from '@loadable/component';
import config from '@plone/volto/registry';
import { Container } from 'semantic-ui-react';
import { Card } from '@package/components';

const Masonry = loadable(() => import('react-masonry-css'));

// TODO: we need special url for exhibitions archive
const getUrl = (info, content) => info['url'];

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

  // TODO: format the AuthorBio. It needs to go into the header part of the
  // view, not in the content part
  console.log(content);

  const [isClient, setIsClient] = React.useState();
  React.useEffect(() => setIsClient(true), []);

  return (
    <div>
      <Portal node={isClient && document.getElementById('heading')}>
        {content.AuthorBio}
      </Portal>
      <div className="author-view">
        <Container>
          <div className="content-container">
            <div className="offset-1-right">
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
              {contextLinks.items
                ?.filter((info) => info.id !== 'artworks')
                .map((info) => (
                  <Card
                    key={info.id}
                    id={info.id}
                    item={{
                      ...getItem(info, content),
                      image_field: 'image',
                    }}
                    {...props}
                    useFallbackImage
                  />
                ))}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
