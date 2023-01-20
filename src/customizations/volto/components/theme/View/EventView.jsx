/**
 * EventView view component.
 * @module components/theme/View/EventView
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';
import { defineMessages, injectIntl } from 'react-intl';
import { hasBlocksData, flattenHTMLToAppURL } from '@plone/volto/helpers';
import { Image, Grid, Segment, Icon, List } from 'semantic-ui-react';
import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';
import { expandToBackendURL } from '@plone/volto/helpers';

import {
  When,
  Recurrence,
} from '@plone/volto/components/theme/View/EventDatesInfo';

const messages = defineMessages({
  visitWebsite: {
    id: 'visit_external_website',
    defaultMessage: 'Visit external website',
  },
  contact: {
    id: 'contact',
    defaultMessage: 'Contact',
  },
  calendar: {
    id: 'Add event to calendar',
    defaultMessage: 'Add to calendar',
  },
});

const EventTextfieldView = ({ content }) => (
  <React.Fragment>
    {content.title && <h1 className="documentFirstHeading">{content.title}</h1>}
    {content.description && (
      <p className="documentDescription">{content.description}</p>
    )}
    {content.image && (
      <Image
        className="document-image"
        src={content.image.scales.thumb.download}
        floated="right"
      />
    )}
    {content.text && (
      <div
        dangerouslySetInnerHTML={{
          __html: flattenHTMLToAppURL(content.text.data),
        }}
      />
    )}
  </React.Fragment>
);

/**
 * EventView view component class.
 * @function EventView
 * @params {object} content Content object.
 * @returns {string} Markup of the component.
 */
const EventView = (props) => {
  const { content, intl } = props;

  const [isClient, setIsClient] = React.useState();

  React.useEffect(() => setIsClient(true), []);

  return (
    <div id="page-document" className="ui container viewwrapper event-view">
      <Portal node={isClient && document.getElementById('heading')}>
        <div>
          {content.start && (
            <When
              start={content.start}
              end={content.end}
              whole_day={content.whole_day}
              open_end={content.open_end}
            />
          )}
        </div>
      </Portal>
      <div className="content-container">
        <Grid>
          <Grid.Row>
            <Grid.Column className="offset-1-right">
              <div className="content-wrapper">
                <Grid>
                  <Grid.Row>
                    <Grid.Column>
                      {hasBlocksData(content) ? (
                        <div className="blocks-bg-wrapper">
                          <div className="event-details">
                            <Segment className="details">
                              <div className="top event-listing">
                                <div className="top-wrapper">
                                  <div className="date-wrapper">
                                    {content.start && (
                                      <div title="Date" className="event-data">
                                        <Icon name="calendar alternate" />
                                        <When
                                          start={content.start}
                                          end={content.end}
                                          whole_day={content.whole_day}
                                          open_end={content.open_end}
                                        />
                                      </div>
                                    )}
                                    |
                                    <div className="event-data">
                                      <Icon name="calendar plus outline" />
                                      <p>
                                        <a
                                          className="ics-download"
                                          target="_blank"
                                          rel="noreferrer"
                                          href={`${expandToBackendURL(
                                            content['@id'],
                                          )}/ics_view`}
                                        >
                                          {intl.formatMessage(
                                            messages.calendar,
                                          )}
                                        </a>
                                      </p>
                                    </div>
                                  </div>
                                  {content.location && (
                                    <div
                                      title="Location"
                                      className="event-data"
                                    >
                                      <Icon name="map marker alternate" />
                                      <p>{content.location}</p>
                                    </div>
                                  )}
                                </div>

                                {content.recurrence && (
                                  <div className="event-data">
                                    <div title="All dates" className="dates">
                                      <Icon name="sync" />
                                      <Recurrence
                                        recurrence={content.recurrence}
                                        start={content.start}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* {content.subjects.length > 0 && (
                                          <li title="Subject">
                                            <Icon name="paste" />
                                            <p>
                                              {content.subjects.map(
                                                (subject, i) => (
                                                  <React.Fragment key={i}>
                                                    {subject}
                                                    {i <
                                                    content.subjects.length - 1
                                                      ? ', '
                                                      : ''}
                                                  </React.Fragment>
                                                ),
                                              )}
                                            </p>
                                          </li>
                                        )} */}
                            </Segment>
                          </div>
                          <RenderBlocks {...props} />

                          <div className="bottom event-details">
                            <h3>{intl.formatMessage(messages.contact)}:</h3>
                            <Segment className="details">
                              <div className="event-listing">
                                <div className="contact-wrapper">
                                  {content.contact_name && (
                                    <div title="Contact" className="event-data">
                                      <Icon name="user circle" />

                                      <p>{content.contact_name}</p>
                                    </div>
                                  )}

                                  {content.contact_email && (
                                    <div title="E-mail" className="event-data">
                                      <Icon name="mail" />
                                      <p>
                                        <a
                                          href={`mailto:${content.contact_email}`}
                                        >
                                          {content.contact_email}
                                        </a>
                                      </p>
                                    </div>
                                  )}

                                  {content.contact_phone && (
                                    <div title="Phone" className="event-data">
                                      <Icon name="phone square" />
                                      <p>{content.contact_phone}</p>
                                    </div>
                                  )}
                                </div>

                                {content.attendees.length > 0 && (
                                  <div title="Attendees" className="event-data">
                                    <Icon name="users" />
                                    <List className="attendees">
                                      {content.attendees.map((attendee, i) => (
                                        <List.Item key={i}>
                                          {attendee}
                                          {i < content.attendees.length - 1
                                            ? ', '
                                            : ''}
                                        </List.Item>
                                      ))}
                                    </List>
                                  </div>
                                )}

                                {content.event_url && (
                                  <div title="Website" className="event-data">
                                    <Icon name="globe" />
                                    <p>
                                      <a
                                        href={content.event_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {intl.formatMessage(
                                          messages.visitWebsite,
                                        )}
                                      </a>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </Segment>
                          </div>
                        </div>
                      ) : (
                        <EventTextfieldView {...props} />
                      )}
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    </div>
  );
};

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
EventView.propTypes = {
  content: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    text: PropTypes.shape({
      data: PropTypes.string,
    }),
    attendees: PropTypes.arrayOf(PropTypes.string).isRequired,
    contact_email: PropTypes.string,
    contact_name: PropTypes.string,
    contact_phone: PropTypes.string,
    end: PropTypes.string.isRequired,
    event_url: PropTypes.string,
    location: PropTypes.string,
    open_end: PropTypes.bool,
    recurrence: PropTypes.any,
    start: PropTypes.string.isRequired,
    subjects: PropTypes.arrayOf(PropTypes.string).isRequired,
    whole_day: PropTypes.bool,
  }).isRequired,
};

export default injectIntl(EventView);
