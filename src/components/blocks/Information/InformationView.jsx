import React from 'react';
import { flattenToAppURL } from '@plone/volto/helpers';
import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import { ConditionalLink, UniversalLink } from '@plone/volto/components';
import { serializeNodes } from '@plone/volto-slate/editor/render';
import { Icon } from '@plone/volto/components';
import cx from 'classnames';

import aheadSVG from '@plone/volto/icons/ahead.svg';
import './style.less';

const InformationView = ({ data, mode = 'view' }) => {
  const { headline, headlineTag, buttons, text } = data;
  const isEditMode = mode === 'edit';
  const HeadlineTag = headlineTag || 'h2';
  const classNames = cx('ui button btn-block', data.btnStyle || 'primary');

  return (
    <div className="block info-block">
      <div className="info-block-wrapper">
        <div className="info-block-header">
          <HeadlineTag className="info-block-title">{headline}</HeadlineTag>
          <Icon name={aheadSVG} size="55px" />
        </div>
        <div> {!!text && serializeNodes(text)}</div>
        <div className="info-block-buttons">
          {(buttons || []).map((l, i) => {
            let href = l.href?.[0]?.['@id'] || '';

            return (
              <span>
                {isInternalURL(href) ? (
                  isEditMode ? (
                    <div className={classNames}>{l.title}</div>
                  ) : (
                    <span>
                      <ConditionalLink
                        to={flattenToAppURL(href)}
                        condition={!isEditMode}
                        className={classNames}
                      >
                        {l.title}
                      </ConditionalLink>
                    </span>
                  )
                ) : href ? (
                  <span>
                    <UniversalLink href={href} className={classNames}>
                      {l.title}
                    </UniversalLink>
                  </span>
                ) : isEditMode ? (
                  'Button'
                ) : null}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InformationView;
