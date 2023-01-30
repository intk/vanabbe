import { Grid, Container } from 'semantic-ui-react';
import { ImageAlbum } from '@package/components';

const EventMedia = ({ value }) => (
  <ul>
    {value
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => !!u)
      .map((u, index) => (
        <li key={index}>
          <a href={u.split('|')[0]}>{u.split('|')[1]}</a>
        </li>
      ))}
  </ul>
);

// http://62.221.199.184:17718/action=get&command=search&query=ccIndexName=VanabbeTentoonstellingen&fields=*&range=0-1000
// https://vanabbemuseum.nl/collectie/details/tentoonstellingen/index.html@lookup[6039][filter][0]=exhibitionCode_stringS%253A1826.html
// To import:
// http://localhost:8080/Plone/nl/archief/@@import_vubis?import=exhibition&max=10&query=recordNumber=102373
export default function ExhibitionView(props) {
  const { content } = props;

  console.log(content);

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
                        itemAuthor={content.authorName}
                      />
                    </div>
                  </div>
                </div>
                <div>{content.eventArtist}</div>
                <div>{content.eventCoorporation}</div>
                <div>{content.eventDescription}</div>
                <div>{content.eventTimeFrom}</div>
                {content.eventMedia?.length > 0 && (
                  <EventMedia value={content.eventMedia} />
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </Container>
    </div>
  );
}
