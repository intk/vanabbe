/**
 * EventView view component.
 * @module components/theme/View/EventView
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';
import { FormattedMessage } from 'react-intl';
import {
  hasBlocksData,
  flattenHTMLToAppURL,
  expandToBackendURL,
} from '@plone/volto/helpers';
import { Image, List } from 'semantic-ui-react';
import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';

import {
  When,
  Recurrence,
} from '@plone/volto/components/theme/View/EventDatesInfo';

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
  const { content } = props;
  const {
    start,
    end,
    whole_day,
    open_end,
    location,
    recurrence,
    contact_name,
    contact_email,
    contact_phone,
    attendees,
    event_url,
  } = content;

  const [isClient, setIsClient] = React.useState();

  React.useEffect(() => setIsClient(true), []);

  return (
    <div id="page-document" className="ui container viewwrapper event-view">
      <Portal node={isClient && document.getElementById('description')}>
        <div>
          {start && (
            <When
              start={start}
              end={end}
              whole_day={whole_day}
              open_end={open_end}
            />
          )}
          {location && (
            <div className="event-data">
              <p>{location}</p>
            </div>
          )}
        </div>
      </Portal>
      <div className="content-container">
        <div className="offset-1-right">
          <div className="content-wrapper">
            {hasBlocksData(content) ? (
              <div className="blocks-bg-wrapper">
                <div className="event-details">
                  <div className="top event-listing">
                    {recurrence && (
                      <div itle="All dates" className="event-data dates">
                        <p>
                          <Recurrence recurrence={recurrence} start={start} />
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <RenderBlocks {...props} />

                <div className="bottom event-details">
                  {(contact_name || contact_email || contact_phone) && (
                    <h3>
                      <FormattedMessage id="Contact" defaultMessage="Contact" />
                      :
                    </h3>
                  )}

                  <div className="event-listing">
                    {contact_name && (
                      <div className="event-data">
                        <p>{contact_name}</p>
                      </div>
                    )}

                    {contact_email && (
                      <div className="event-data">
                        <p>
                          <a href={`mailto:${contact_email}`}>
                            {contact_email}
                          </a>
                        </p>
                      </div>
                    )}

                    {contact_phone && (
                      <div className="event-data">
                        <p>{contact_phone}</p>
                      </div>
                    )}

                    {attendees.length > 0 && (
                      <div title="Attendees" className="event-data">
                        <List className="attendees">
                          {attendees.map((attendee, i) => (
                            <List.Item key={i}>
                              {attendee}
                              {i < attendees.length - 1 ? ', ' : ''}
                            </List.Item>
                          ))}
                        </List>
                      </div>
                    )}

                    {event_url && (
                      <div title="Website" className="event-data">
                        <p>
                          <a
                            href={event_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FormattedMessage
                              id="visit_external_website"
                              defaultMessage="Visit external website"
                            />
                          </a>
                        </p>
                      </div>
                    )}
                    <div className="event-data event-calendar">
                      <p>
                        <a
                          className="ics-download"
                          target="_blank"
                          rel="noreferrer"
                          href={`${expandToBackendURL(
                            content['@id'],
                          )}/ics_view`}
                        >
                          <FormattedMessage
                            id="Add event to calendar"
                            defaultMessage="Add event to calendar"
                          />
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EventTextfieldView {...props} />
            )}
          </div>
        </div>
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

export default EventView;
