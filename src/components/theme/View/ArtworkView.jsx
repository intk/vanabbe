// http://localhost:8080/Plone/nl/archief/@@import_vubis?import=artwork&max=10&query=authorName=Douglas%20Gordon
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Container } from 'semantic-ui-react';
import { Card } from '@package/components'; // SocialLinks,
import ImageAlbum from '../ImageAlbum/ImageAlbum';
import config from '@plone/volto/registry';

const getItem = (info, content) => {
  return info.type === 'other_artworks'
    ? {
        '@id': info['preview'],
        title: (
          <FormattedMessage
            id="more_artworks_by"
            defaultMessage="More artworks by {authorName}"
            values={{ authorName: info.authorName }}
          />
        ),
        href: info.href,
      }
    : info.type === 'period'
    ? {
        '@id': info['preview'],
        title: (
          <FormattedMessage
            id="more_artworks_in_period"
            defaultMessage="More artworks from this period"
          />
        ),
        href: info.href,
      }
    : info.type === 'publications'
    ? {
        '@id': info['preview'],
        title: (
          <FormattedMessage
            id="publications_by_author_name"
            defaultMessage="Publications with or about {authorName}"
            values={info}
          />
        ),
        href: info.href,
      }
    : info.type === 'exhibitions'
    ? {
        '@id': info['preview'],
        title: (
          <FormattedMessage
            id="exhibitions_by_author_name"
            defaultMessage="Exhibitions with {authorName}"
            values={info}
          />
        ),
        href: info.href,
      }
    : null;
};

const ObjectLinks = ({ content }) => {
  const res = [];

  if (content.ObjectAudio) {
    const audio = JSON.parse(content.ObjectAudio);
    try {
      res.push(
        audio.map(({ title, filename }, ix) => (
          <div className="object-audio">
            <a
              key={`${ix}-${filename}`}
              href={`https://mediabank.vanabbemuseum.nl/website/Media/${filename}`}
            >
              {title}
            </a>
          </div>
        )),
      );
    } catch {}
  }

  if (content.ObjectVideo) {
    try {
      const video = JSON.parse(content.ObjectVideo);
      res.push(
        video.map(({ title, filename }, ix) => (
          <div className="object-video">
            <a
              key={`${ix}-${filename}`}
              href={`https://mediabank.vanabbemuseum.nl/website/Media/${filename}`}
            >
              {title}
            </a>
          </div>
        )),
      );
    } catch {}
  }

  return res;
};

export default function ArtworkView(props) {
  const { registratorMail } = config.settings;
  const { content } = props;
  const columns = [];

  const components = content['@components'] || {};
  const { contextLinks = {} } = components;

  if (content.objectDescription) {
    if (!content.objectDescription.match(/<br|<a/g)) {
      (content.objectDescription || '').split('%').forEach((text) => {
        const col = [];

        text
          .split('\n')
          .filter((p) => !!p)
          .forEach((p) => {
            col.push(p);
          });
        columns.push(col);
      });
    } else {
      columns.push([content.objectDescription]);
    }
  }

  const Item = ({ info }) => {
    return (
      <Grid.Column mobile={12} tablet={6} computer={3}>
        <Card
          id={info.type}
          item={{
            ...getItem(info, content),
            image_field: 'image',
          }}
          {...props}
          useFallbackImage
        />
      </Grid.Column>
    );
  };

  const authors = content.authors.map((auth) => auth.title).join(', ');
  // console.log(contextLinks.items);
  const contextLinkCards = contextLinks.items?.reduce((acc, info) => {
    const local = info.items
      ? info.items.map((item, index) => (
          <Item info={item} key={`${info.id}-${index}`} />
        ))
      : [<Item key={info.type || info.id} info={info} />];

    return [...acc, ...local];
  }, []);
  const linkAuthors = contextLinks?.authors || content.authors;

  return (
    <div className="artwork-view">
      <Container>
        <div className="content-container">
          <Grid>
            <Grid.Row>
              <Grid.Column className="offset-1-right">
                <div className="content-wrapper">
                  <div className="artwork-container">
                    <div className="artwork-top">
                      <ImageAlbum
                        items={content.items}
                        itemTitle={content.objectTitle}
                        itemAuthor={authors}
                      />

                      <div className="artwork-meta">
                        <h3 className="object-creation">
                          {content.objectCreationDate}
                        </h3>
                        {/* <h2>{content.objectTitle}</h2> */}

                        {linkAuthors.map((auth, index) => (
                          <h2 key={index}>
                            <a
                              href={auth.detailsHref}
                              title={auth.detailsHrefTitle}
                            >
                              {auth.title}
                            </a>
                          </h2>
                        ))}

                        <div className="object-medium object-metadata">
                          {content.objectMedium}
                        </div>

                        <div className="object-dimensions object-metadata">
                          {content.dimensions}
                        </div>

                        {!content.objectIsVisible && (
                          <div className="object-location">
                            <FormattedMessage
                              id="Not on display"
                              defaultMessage="Not on display"
                            />
                          </div>
                        )}

                        <div className="acquired">
                          <FormattedMessage
                            id="Acquired in"
                            defaultMessage="Acquired in {objectYearPurchase}"
                            values={content}
                          />
                        </div>
                        <div className="inventory-number">
                          <FormattedMessage
                            id="Inventory number"
                            defaultMessage="Inventory number {objectID}"
                            values={content}
                          />
                        </div>

                        <div className="inventory-number">
                          {content.objectCredit}
                        </div>

                        {content.ObjectAudio || content.ObjectVideo ? (
                          <div className="object-links">
                            <ObjectLinks content={content} />
                          </div>
                        ) : null}

                        <div className="info">
                          <p>
                            <FormattedMessage
                              id="van_abbe_2800"
                              defaultMessage="The Van Abbemuseum Collection consists of over 2800 artworks. We publish texts and images on an ongoing basis, but this record is currently in the process of being documented."
                            />
                          </p>
                          <p>
                            <FormattedMessage
                              id="need_info_specific"
                              defaultMessage="If you need specific information on this work or artist, remember that the Van Abbemuseum Library is at your disposal, or feel free to write to the library."
                            />
                          </p>
                          {/* <div className="computer large screen widescreen only"> */}
                          {/*   <SocialLinks /> */}
                          {/* </div> */}
                        </div>
                      </div>
                    </div>
                    <div className="artwork-content offset-1-left offset-2-right">
                      <h4>
                        <FormattedMessage
                          id="Description"
                          defaultMessage="Description"
                        />
                      </h4>
                      {columns.map((col, index) => (
                        <p
                          key={index}
                          dangerouslySetInnerHTML={{ __html: col }}
                        />
                      ))}
                      {content.objectDescription_extra ? (
                        <>
                          <h4>{content.objectDescription_extra_title}</h4>
                          <p
                            dangerouslySetInnerHTML={{
                              __html: content.objectDescription_extra,
                            }}
                          />
                        </>
                      ) : null}

                      <p className="artwork-content-footer">
                        <FormattedMessage
                          id="does_this_contain_innacurate"
                          defaultMessage="Does this page contain inaccurate information or language that you feel we should improve or change?"
                        />{' '}
                        <a href={registratorMail}>
                          <FormattedMessage
                            id="would_like_to_hear"
                            defaultMessage="We would like to hear from you"
                          />
                          .
                        </a>
                      </p>
                      {/* <div className="image-wrapper mobile tablet only"> */}
                      {/*   <SocialLinks /> */}
                      {/* </div> */}
                    </div>
                  </div>
                </div>

                <h2 className="context-title">
                  <FormattedMessage id="Context" defaultMessage="Context" />
                </h2>
                <Grid columns={4} className="listings">
                  {contextLinkCards}
                </Grid>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </Container>
    </div>
  );
}

/**

{
  "@id": "http://localhost:3000/en/archive/1416",
  "@type": "artwork",
  "UID": "435a9df57fda41ed9d19bc57e0862b49",
  "allow_discussion": false,
  "authorBio": null,
  "authorBirthDate": 1936,
  "authorDeathDate": 2007,
  "authorID": "166",
  "authorName": "Luciano Fabro",
  "authorSortName": null,
  "authorURL": "https://nl.wikipedia.org/wiki/Luciano_Fabro\nhttps://en.wikipedia.org/wiki/Luciano_Fabro",
  "authorURLTitle": null,
  "ccIdentifier": "C1416",
  "ccIndexName": "VanAbbeCollectie",
  "ccObjectID": "1416",
  "created": "2022-11-20T17:53:32+00:00",
  "description": "",
  "dimensions": null,
  "id": "1416",
  "is_folderish": true,
  "items": [
    {
      "@id": "http://localhost:3000/en/archive/1416/1158.JPG",
      "@type": "Image",
      "description": "",
      "image_field": "image",
      "image_scales": {
        "image": [
          {
            "content-type": "image/jpeg",
            "download": "@@images/image-620-8b230ca9345a7e0abcfca987557f70bb.jpeg",
            "filename": "1158.JPG",
            "height": 800,
            "scales": {
              "icon": {
                "download": "@@images/image-32-0e80c354888bbe6c8ff246dfde5f79f4.jpeg",
                "height": 32,
                "width": 24
              },
              "mini": {
                "download": "@@images/image-200-3d275232ea34a0ee6503e2c8ed081d76.jpeg",
                "height": 258,
                "width": 200
              },
              "preview": {
                "download": "@@images/image-400-5632826292d51aec78a9d96394a0a3d5.jpeg",
                "height": 516,
                "width": 400
              },
              "teaser": {
                "download": "@@images/image-600-b33c37f9951035824d7628ddeb3c76f6.jpeg",
                "height": 774,
                "width": 600
              },
              "thumb": {
                "download": "@@images/image-128-0c4fed9b54df08fc7d5fec09282c0b0a.jpeg",
                "height": 128,
                "width": 99
              },
              "tile": {
                "download": "@@images/image-64-f7362920d9d2d744b261766ffe3c54ba.jpeg",
                "height": 64,
                "width": 49
              }
            },
            "size": 354639,
            "width": 620
          }
        ]
      },
      "review_state": null,
      "title": "1158.JPG"
    }
  ],
  "items_total": 1,
  "layout": "artwork_view",
  "lock": {},
  "modified": "2022-11-20T17:59:09+00:00",
  "objectCreationDate": "1982",
  "objectCreationDateFrom": 1982,
  "objectCreationDateTo": 1982,
  "objectCredit": null,
  "objectDescription": null,
  "objectID": "1158",
  "objectMedium": "ijzer, koper, hout, bitumen, verguld hout\niron, copper, wood, bitumen, gilded wood",
  "objectTitle": "Mercurio\nMercurius\nMercury",
  "objectYearPurchase": 1983,
  "recordnumber": 1007,
  "review_state": "private",
  "title": "1416",
  "version": "current",
  "working_copy": null,
  "working_copy_of": null
}
*/
