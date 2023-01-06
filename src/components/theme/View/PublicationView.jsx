import React from 'react';
import { Grid, Container } from 'semantic-ui-react';
import { SocialLinks } from '@package/components';
import ImageAlbum from '../ImageAlbum/ImageAlbum';

export default function PublicationView(props) {
  const { content } = props;

  return (
    <div className="publication-view artwork-view">
      <Container>
        <div className="content-container">
          <Grid>
            <Grid.Row>
              <Grid.Column className="column-offset-1-right">
                <div className="content-wrapper">
                  <div className="artwork-container">
                    <div className="artwork-top">
                      <div>
                        <ImageAlbum items={content.items} />
                        <div className="info">
                          <SocialLinks hideTitle={true} />
                        </div>
                      </div>

                      <div className="artwork-meta">
                        <h2 className="object-author">
                          {content.bookauthorName}
                        </h2>
                        <h3 className="object-artist">{content.bookArtist}</h3>
                        <h4 className="object-publisher">
                          {content.bookPublisher}
                        </h4>

                        <div>{content.bookLanguage}</div>
                        <div className="object-creation">
                          {content.bookDatePublished}
                        </div>
                        <div className="bookBinding">{content.bookBinding}</div>
                        <div>{content.bookAnnotation}</div>

                        {/* <div className="bookCity">{content.bookCity}</div> */}

                        <div className="object-shelfmark">
                          Located in: {content.bookShelfmark}
                        </div>
                        <div className="object-id">
                          VUBIS:{' '}
                          <a href={content.ccIdentifier}>
                            {content.bookVubisid}
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="artwork-content column-offset-1-left column-offset-2-right">
                      <h4>Description</h4>

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
