import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Container } from 'semantic-ui-react';
import { SocialLinks } from '@package/components';
import ImageAlbum from '../ImageAlbum/ImageAlbum';

export default function PublicationView(props) {
  const { content } = props;

  const bookAuthor = Array.isArray(content.bookauthorName)
    ? content.bookauthorName.join(', ')
    : content.bookauthorName;

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
                        <h2 className="object-author">
                          {content.bookauthorName}
                        </h2>
                        <h3 className="object-artist">{content.bookArtist}</h3>
                        <h4 className="object-publisher">
                          {content.bookCity}, {content.bookPublisher}
                        </h4>

                        <div>{content.bookLanguage}</div>
                        <div className="object-creation">
                          {content.bookDatePublished}
                        </div>
                        <div className="bookBinding">{content.bookBinding}</div>
                        <div>{content.bookAnnotation}</div>

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
