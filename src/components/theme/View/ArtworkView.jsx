import React from 'react';
import { Grid, Container } from 'semantic-ui-react';
import { SocialLinks } from '@package/components';
import ImageAlbum from '../ImageAlbum/ImageAlbum';

export default function ArtworkView(props) {
  const { content } = props;

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
                      <ImageAlbum items={content.items} />

                      <div className="artwork-meta">
                        <h3 className="object-creation">
                          {content.objectCreationDate}
                        </h3>
                        {/* <h2>{content.objectTitle}</h2> */}
                        <h2>{content.authorName}</h2>

                        <div className="object-medium">
                          {content.objectMedium}
                        </div>
                        <div className="object-location">Not on display</div>
                        <div className="acquired">
                          Acquired in {content.objectYearPurchase}
                        </div>
                        <div className="inventory-number">
                          Inventory number {content.objectID}
                        </div>

                        <div className="info">
                          <p>
                            The Van Abbemuseum Collection consists of over 2800
                            artworks. We publish texts and images on an ongoing
                            basis, but this record is currently in the process
                            of being documented..
                          </p>
                          <p>
                            If you need specific information on this work or
                            artist, remember that the Van Abbemuseum Library is
                            at your disposal, or feel free to write to the
                            library.
                          </p>
                          <SocialLinks hideTitle={true} />
                        </div>
                      </div>
                    </div>
                    <div className="artwork-content offset-1-left offset-2-right">
                      <h4>Description</h4>
                      ...
                      <p>
                        Does this page contain inaccurate information or
                        language that you feel we should improve or change? We
                        would like to hear from you.
                      </p>
                    </div>
                  </div>
                </div>
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
