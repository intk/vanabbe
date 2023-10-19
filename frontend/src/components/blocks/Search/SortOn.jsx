import React from 'react';
import { Button, Checkbox } from 'semantic-ui-react';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import { compose } from 'redux';
import { Icon } from '@plone/volto/components';

import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';

import upSVG from '@plone/volto/icons/sort-up.svg';
import downSVG from '@plone/volto/icons/sort-down.svg';

const messages = defineMessages({
  noSelection: {
    id: 'No selection',
    defaultMessage: 'No selection',
  },
  sortOn: {
    id: 'Sort',
    defaultMessage: 'Sort',
  },
  ascending: {
    id: 'Ascending',
    defaultMessage: 'Ascending',
  },
  descending: {
    id: 'Descending',
    defaultMessage: 'Descending',
  },
  date: {
    id: 'event_date',
    defaultMessage: 'Datum',
  },
  sortableTitle: {
    id: 'sorting_title',
    defaultMessage: 'sorteerbare titel',
  },
  publishDate: {
    id: 'publish_date',
    defaultMessage: 'publiceer datum',
  },
  sortOldest: {
    id: 'sortOldest',
    defaultMessage: 'oldest',
  },
  sortNewest: {
    id: 'sortNewest',
    defaultMessage: 'newest',
  },
});

const SortOn = (props) => {
  const {
    data = {},
    sortOn = null,
    sortOrder = null,
    setSortOn,
    setSortOrder,
    isEditMode,
    querystring = {},
    intl,
  } = props;
  const { sortable_indexes } = querystring;

  const activeSortOn = sortOn || data?.query?.sort_on || '';

  const { sortOnOptions = [] } = data;
  const value = activeSortOn || intl.formatMessage(messages.noSelection);

  return (
    <div className="search-sort-wrapper">
      <div className="search-sort-on">
        <span className="sort-label">
          {intl.formatMessage(messages.sortOn)}
        </span>
        {console.log(sortOnOptions)}

        <div className="entries">
          {sortOnOptions.map((opt, i) => {
            const title = sortable_indexes[opt]?.title;
            let labelTitle;

            if (title === 'orteerbare titel' || title === 'Sortable Title') {
              labelTitle = intl.formatMessage(messages.sortableTitle);
            } else if (title === 'Book publish date') {
              labelTitle = intl.formatMessage(messages.publishDate);
            } else if (title === 'Datum') {
              labelTitle = intl.formatMessage(messages.date);
            } else {
              labelTitle = title || opt;
            }

            if (opt === 'sortable_title') {
              return (
                <>
                  <React.Fragment key={i}>
                    <div className="entry">
                      <Checkbox
                        radio
                        disabled={isEditMode}
                        label={<label>A-Z</label>}
                        checked={opt === value && sortOrder === 'ascending'}
                        onChange={() => {
                          setSortOn(opt);
                        }}
                        onClick={() => {
                          !isEditMode && setSortOrder('ascending');
                        }}
                      />
                    </div>
                  </React.Fragment>
                  <React.Fragment key={i + 1}>
                    <div className="entry">
                      <Checkbox
                        radio
                        disabled={isEditMode}
                        label={<label>Z-A</label>}
                        checked={opt === value && sortOrder === 'descending'}
                        onChange={() => {
                          setSortOn(opt);
                        }}
                        onClick={() => {
                          !isEditMode && setSortOrder('descending');
                        }}
                      />
                    </div>
                  </React.Fragment>
                </>
              );
            } else if (opt === 'objectCreationDate') {
              return (
                <>
                  <React.Fragment key={i}>
                    <div className="entry">
                      <Checkbox
                        radio
                        disabled={isEditMode}
                        label={
                          <label>
                            {intl.formatMessage(messages.sortNewest)}
                          </label>
                        }
                        checked={opt === value && sortOrder === 'descending'}
                        onChange={() => {
                          setSortOn(opt);
                        }}
                        onClick={() => {
                          !isEditMode && setSortOrder('descending');
                        }}
                      />
                    </div>
                  </React.Fragment>
                  <React.Fragment key={i + 1}>
                    <div className="entry">
                      <Checkbox
                        radio
                        disabled={isEditMode}
                        label={
                          <label>
                            {intl.formatMessage(messages.sortOldest)}
                          </label>
                        }
                        checked={opt === value && sortOrder === 'ascending'}
                        onChange={() => {
                          setSortOn(opt);
                        }}
                        onClick={() => {
                          !isEditMode && setSortOrder('ascending');
                        }}
                      />
                    </div>
                  </React.Fragment>
                </>
              );
            } else if (opt === 'bookDatePublished') {
              return (
                <>
                  <React.Fragment key={i}>
                    <div className="entry">
                      <Checkbox
                        radio
                        disabled={isEditMode}
                        label={
                          <label>
                            {intl.formatMessage(messages.sortNewest)}
                          </label>
                        }
                        checked={opt === value && sortOrder === 'descending'}
                        onChange={() => {
                          setSortOn(opt);
                        }}
                        onClick={() => {
                          !isEditMode && setSortOrder('descending');
                        }}
                      />
                    </div>
                  </React.Fragment>
                  <React.Fragment key={i + 1}>
                    <div className="entry">
                      <Checkbox
                        radio
                        disabled={isEditMode}
                        label={
                          <label>
                            {intl.formatMessage(messages.sortOldest)}
                          </label>
                        }
                        checked={opt === value && sortOrder === 'ascending'}
                        onChange={() => {
                          setSortOn(opt);
                        }}
                        onClick={() => {
                          !isEditMode && setSortOrder('ascending');
                        }}
                      />
                    </div>
                  </React.Fragment>
                </>
              );
            } else if (opt === 'eventTimeStart') {
              return (
                <>
                  <React.Fragment key={i}>
                    <div className="entry">
                      <Checkbox
                        radio
                        disabled={isEditMode}
                        label={
                          <label>
                            {intl.formatMessage(messages.sortNewest)}
                          </label>
                        }
                        checked={opt === value && sortOrder === 'descending'}
                        onChange={() => {
                          setSortOn(opt);
                        }}
                        onClick={() => {
                          !isEditMode && setSortOrder('descending');
                        }}
                      />
                    </div>
                  </React.Fragment>
                  <React.Fragment key={i + 1}>
                    <div className="entry">
                      <Checkbox
                        radio
                        disabled={isEditMode}
                        label={
                          <label>
                            {intl.formatMessage(messages.sortOldest)}
                          </label>
                        }
                        checked={opt === value && sortOrder === 'ascending'}
                        onChange={() => {
                          setSortOn(opt);
                        }}
                        onClick={() => {
                          !isEditMode && setSortOrder('ascending');
                        }}
                      />
                    </div>
                  </React.Fragment>
                </>
              );
            } else {
              return (
                <div className="entry" key={i}>
                  <Checkbox
                    radio
                    disabled={isEditMode}
                    label={<label>{labelTitle}</label>}
                    checked={opt === value}
                    onChange={() => {
                      setSortOn(opt);
                    }}
                  />
                </div>
              );
            }
          })}
        </div>
      </div>
      {/* <Button
        icon
        basic
        compact
        title={intl.formatMessage(messages.ascending)}
        className={cx({
          active: sortOrder === 'ascending',
        })}
        onClick={() => {
          !isEditMode && setSortOrder('ascending');
        }}
      >
        <Icon name={upSVG} size="25px" />
      </Button>
      <Button
        icon
        basic
        compact
        title={intl.formatMessage(messages.descending)}
        className={cx({
          active: sortOrder === 'descending',
        })}
        onClick={() => {
          !isEditMode && setSortOrder('descending');
        }}
      >
        <Icon name={downSVG} size="25px" />
      </Button> */}
    </div>
  );
};

export default compose(injectIntl, injectLazyLibs(['reactSelect']))(SortOn);
