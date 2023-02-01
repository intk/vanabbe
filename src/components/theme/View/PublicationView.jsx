// To import:
// http://localhost:8080/Plone/nl/archief/@@import_vubis?import=publication&max=10&query=bookArtist=Gordon,%20Douglas

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Container } from 'semantic-ui-react';
import { ImageAlbum, SocialLinks } from '@package/components';

export default function PublicationView(props) {
  const { content } = props;

  let { bookauthorName = [] } = content;
  if (!Array.isArray(bookauthorName))
    bookauthorName = bookauthorName.split('\n').map((a) => a.trim());
  const bookAuthor = bookauthorName.map((author, i) => {
    return <div key={i}>{author}</div>;
  });

  return (
    <div className="publication-view artwork-view">
      <Container>
        <div className="content-container">
          <Grid>
            <Grid.Row>
              <Grid.Column className="offset-1-right">
                <div className="content-wrapper">
                  <div className="artwork-container">
                    <div className="artwork-top">
                      <div>
                        <ImageAlbum
                          items={content.items}
                          itemTitle={content.title}
                          itemAuthor={bookAuthor}
                        />

                        <SocialLinks />
                      </div>

                      <div className="artwork-meta">
                        <h2 className="object-author">{bookAuthor}</h2>

                        {content?.bookArtist.map((artist, i) => {
                          return (
                            <h3 className="object-artist" key={i}>
                              {artist}
                            </h3>
                          );
                        })}

                        {/* <h4 className="object-publisher">
                          {content.bookCity}, {content.bookPublisher}
                        </h4> */}

                        <div className="pub-info">
                          <div>{content.bookLanguage}</div>
                          <div className="object-creation">
                            {content.bookDatePublished}
                          </div>
                          <div className="bookBinding">
                            {content.bookBinding}
                          </div>
                          <div>{content.bookAnnotation}</div>
                        </div>

                        {/* <div className="bookCity">{content.bookCity}</div> */}

                        <div className="object-shelfmark">
                          <FormattedMessage
                            id="Located in"
                            defaultMessage="Located in"
                          />
                          : {content.bookShelfmark}
                        </div>
                        <div className="object-id">
                          <FormattedMessage id="VUBIS" defaultMessage="VUBIS" />
                          :{' '}
                          <a
                            href={content.ccIdentifier}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {content.bookVubisid}
                          </a>
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

                      <p>{content.bookDescription}</p>
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
