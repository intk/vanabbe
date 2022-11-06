import React from 'react';
import { DateTime } from 'luxon';
// import * as dateFns from 'date-fns';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';

export const long_date_format = {
  // Thursday, December 9, 2021 at 10:39 AM
  dateStyle: 'full',
  timeStyle: 'short',
};

const readableTime = (d) =>
  new Intl.DateTimeFormat('en', long_date_format).format(d);

const MONTH = 'MMMM';
const DAY = 'dd';
const YEAR = 'yyyy';

const dformat = `${MONTH} ${DAY}, ${YEAR}`;
const noYearFormat = `${MONTH} ${DAY}`;

export const FormattedDate = injectLazyLibs(['dateFns'])(
  ({ isoDate, format, dateFns }) => {
    if (!isoDate) return null;
    const date = DateTime.fromISO(isoDate);
    let out;

    if (format === 'date') {
      out = date.toLocaleString(DateTime.DATE_SHORT);
    } else if (format === 'long') {
      out = dateFns.format(dateFns.parseISO(isoDate), dformat);
    } else if (format) {
      out = date.toFormat(format);
    } else {
      out = date.toLocaleString(DateTime.DATE_SHORT);
    }
    return (
      <time dateTime={date} className="formatted-date">
        {out}
      </time>
    );
  },
);

export const FormattedDateRange = injectLazyLibs(['dateFns'])(
  ({ start, end, dateFns }) => {
    const startD = dateFns.parseISO(start);
    const endD = dateFns.parseISO(end);
    const now = new Date();

    // See https://date-fns.org/v2.28.0/docs/format

    if (dateFns.isFuture(startD)) {
      const diffStart = dateFns.differenceInCalendarDays(startD, now);
      if (diffStart > 6) {
        return (
          <>
            <time dateTime={startD} title={readableTime(startD)}>
              {dateFns.format(startD, dformat)}
            </time>
            {` - `}
            <time dateTime={endD} title={readableTime(endD)}>
              {dateFns.format(endD, dformat)}
            </time>
          </>
        );
      }
      return (
        <>
          <time dateTime={startD} title={readableTime(startD)}>
            {dateFns.formatRelative(startD, new Date())}
          </time>
          {` - `}
          <time dateTime={endD} title={readableTime(endD)}>
            {dateFns.format(endD, dformat)}
          </time>
        </>
      );
    }

    if (dateFns.isSameDay(startD, endD) && dateFns.isSameYear(startD, now)) {
      // current year, past date (which happens same day)
      return (
        <time dateTime={startD} title={readableTime(startD)}>
          {`${dateFns.format(startD, 'PPP')} ${dateFns.format(
            startD,
            'p',
          )} - ${dateFns.format(endD, 'p O')}`}
        </time>
      );
    }

    if (dateFns.isSameDay(startD, endD)) {
      return (
        <time dateTime={startD} title={readableTime(startD)}>
          {dateFns.format(startD, dformat)}
        </time>
      );
    }

    if (dateFns.isSameYear(startD, endD)) {
      return (
        <>
          <time dateTime={startD} title={readableTime(startD)}>
            {dateFns.format(startD, noYearFormat)}
          </time>
          {` - `}
          <time dateTime={endD} title={readableTime(endD)}>
            {dateFns.format(endD, dformat)}
          </time>
        </>
      );
    }

    return (
      <>
        <time dateTime={startD} title={readableTime(startD)}>
          {dateFns.format(startD, dformat)}
        </time>
        {` - `}
        <time dateTime={endD} title={readableTime(endD)}>
          {dateFns.format(endD, dformat)}
        </time>
      </>
    );
  },
);
