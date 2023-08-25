import React from 'react';
import { flattenToAppURL } from '@plone/volto/helpers';
import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import { ConditionalLink, UniversalLink } from '@plone/volto/components';
import { serializeNodes } from '@plone/volto-slate/editor/render';
import { Icon } from '@plone/volto/components';

import aheadSVG from '@plone/volto/icons/ahead.svg';
import './style.less';

const InformationView = ({ data, mode = 'view' }) => {
  const { headline, headlinelink, headlineTag, buttons, text } = data;
  const isEditMode = mode === 'edit';
  const HeadlineTag = headlineTag || 'h2';

  return (
    <div className="block info-block">
      <div className="info-block-wrapper">
        <a
          href={
            headlinelink && headlinelink[0] && headlinelink[0]['@id']
              ? headlinelink[0]['@id']
              : ''
          }
        >
          <div className="info-block-header">
            <HeadlineTag className="info-block-title">{headline}</HeadlineTag>
            <div>
              <Icon name={aheadSVG} size="55px" />
            </div>
          </div>
        </a>
        <div> {!!text && serializeNodes(text)}</div>
        <div className="info-block-buttons">
          {(buttons || []).map((btn, i) => {
            let href = btn.href?.[0]?.['@id'] || '';

            return (
              <React.Fragment key={i}>
                {isInternalURL(href) ? (
                  isEditMode ? (
                    <div className="ui button primary">{btn.title}</div>
                  ) : (
                    <ConditionalLink
                      to={flattenToAppURL(href)}
                      condition={!isEditMode}
                      className="ui button primary"
                    >
                      {btn.title}
                    </ConditionalLink>
                  )
                ) : href ? (
                  <UniversalLink href={href} className="ui button primary">
                    {btn.title}
                  </UniversalLink>
                ) : isEditMode ? (
                  'Button'
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InformationView;
