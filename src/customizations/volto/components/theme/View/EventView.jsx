/**
 * EventView view component.
 * @module components/theme/View/EventView
 */

import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { flattenHTMLToAppURL } from '@plone/volto/helpers';
import { Container, Image, Segment, Grid, Icon } from 'semantic-ui-react';
import { hasBlocksData } from '@plone/volto/helpers';
import { expandToBackendURL } from '@plone/volto/helpers';

import {
  When,
  Recurrence,
} from '@plone/volto/components/theme/View/EventDatesInfo';

const messages = defineMessages({
  what: {
    id: 'event_what',
    defaultMessage: 'What',
  },
  allDates: {
    id: 'event_alldates',
    defaultMessage: 'All dates',
  },
  attendees: {
    id: 'event_attendees',
    defaultMessage: 'Attendees',
  },
  visitWebsite: {
    id: 'visit_external_website',
    defaultMessage: 'Visit external website',
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
  const { intl, content } = props;

  return (
    <Container id="page-document" className="view-wrapper event-view">
      <Grid>
        <Grid.Column computer={8} tablet={12}>
          <div className="events-container">
            <div className="events-content">
              {hasBlocksData(content) ? (
                <RenderBlocks {...props} />
              ) : (
                <EventTextfieldView {...props} />
              )}
            </div>
          </div>
        </Grid.Column>
        <Grid.Column computer={4} tablet={12}>
          <div className="event-details">
            <Segment className="details">
              <div className="event-single-listing pattern-green">
                <h3>Event Info</h3>

                <ul className="event-listing">
                  <li title="Date">
                    <Icon name="clock outline" size="large" />
                    <When
                      start={content.start}
                      end={content.end}
                      whole_day={content.whole_day}
                      open_end={content.open_end}
                    />
                  </li>
                  {content.location && (
                    <li title="Location">
                      <Icon name="map marker alternate" size="large" />
                      <p>{content.location}</p>
                    </li>
                  )}

                  {content.subjects.length > 0 && (
                    <li title="Subject">
                      <Icon name="images outline" size="large" />
                      <p>
                        {content.subjects.map((subject, i) => (
                          <React.Fragment key={i}>
                            {subject}
                            {i < content.subjects.length - 1 ? ', ' : ''}
                          </React.Fragment>
                        ))}
                      </p>
                    </li>
                  )}

                  <li>
                    <Icon name="calendar alternate" size="large" />
                    <p>
                      <a
                        className="ics-download"
                        target="_blank"
                        rel="noreferrer"
                        href={`${expandToBackendURL(content['@id'])}/ics_view`}
                      >
                        Add event to calendar
                      </a>
                    </p>
                  </li>

                  {content.recurrence && (
                    <li title="All dates" className="dates">
                      <Icon name="sync" size="large" />
                      <Recurrence
                        recurrence={content.recurrence}
                        start={content.start}
                      />
                    </li>
                  )}
                </ul>
              </div>

              <div className="event-single-listing pattern-orange">
                <h3>Organizer</h3>
                <ul className="event-listing">
                  {content.contact_name && (
                    <li title="Contact">
                      <Icon name="user circle" size="large" />

                      <p>{content.contact_name}</p>
                    </li>
                  )}

                  {content.contact_email && (
                    <li title="E-mail">
                      <Icon name="mail outline" size="large" />
                      <p>
                        <a href={`mailto:${content.contact_email}`}>
                          {content.contact_email}
                        </a>
                      </p>
                    </li>
                  )}

                  {content.contact_phone && (
                    <li title="Phone">
                      <Icon name="phone" size="large" />
                      <p>{content.contact_phone}</p>
                    </li>
                  )}

                  {content.event_url && (
                    <li title="Website">
                      <Icon name="globe" size="large" />
                      <p>
                        <a
                          href={content.event_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {intl.formatMessage(messages.visitWebsite)}
                        </a>
                      </p>
                    </li>
                  )}

                  {content.attendees.length > 0 && (
                    <li title="Attendees">
                      <Icon name="users" size="large" />
                      <p>
                        {content.attendees.map((attendee, i) => (
                          <React.Fragment key={i}>
                            {attendee}
                            {i < content.attendees.length - 1 ? ', ' : ''}
                          </React.Fragment>
                        ))}
                      </p>
                    </li>
                  )}
                </ul>
              </div>
            </Segment>
          </div>
        </Grid.Column>
      </Grid>
    </Container>
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
