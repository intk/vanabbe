// To import:
//
// http://localhost:8080/Plone/nl/archief/@@import_vubis?import=exhibition&max=10&query=eventArtist=Gordon,%20Douglas
//
// http://localhost:8080/Plone/nl/archief/@@import_vubis?import=exhibition&max=10&query=recordNumber=102373
//
// http://62.221.199.184:17718/action=get&command=search&query=ccIndexName=VanabbeTentoonstellingen&fields=*&range=0-1000
// https://vanabbemuseum.nl/collectie/details/tentoonstellingen/index.html@lookup[6039][filter][0]=exhibitionCode_stringS%253A1826.html

import { Grid, Container } from 'semantic-ui-react';
import { ImageAlbum } from '@package/components'; // SocialLinks

const EventMedia = ({ value }) => (
  <ul className="event-media-list">
    {value
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => !!u)
      .map((u, index) => (
        <li key={index}>
          <a href={u.split('|')[0]} target="_blank" rel="noreferrer">
            {u.split('|')[1]}
          </a>
        </li>
      ))}
  </ul>
);

export default function ExhibitionView(props) {
  const { content } = props;

  return (
    <div className="exhibition artwork-view">
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
                          itemAuthor={content.eventArtist}
                        />

                        {/* <SocialLinks /> */}
                      </div>
                      <div className="artwork-meta">
                        {content.eventArtist?.map((a, i) => (
                          <div class="object-author" key={i}>
                            {a}
                          </div>
                        ))}
                        <h5 className="event-time">{content.eventTimeFrom}</h5>
                        <div className="info">
                          <p>{content.eventCoorporation}</p>
                        </div>

                        {content.eventMedia?.length > 0 && (
                          <EventMedia value={content.eventMedia} />
                        )}
                      </div>
                    </div>
                    <div className="artwork-content offset-1-left offset-2-right">
                      <div>{content.eventDescription}</div>
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
