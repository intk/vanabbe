import React from 'react';
import { flattenToAppURL } from '@plone/volto/helpers';
import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import { ConditionalLink, UniversalLink } from '@plone/volto/components';
import cx from 'classnames';

const ButtonView = ({ data, mode = 'view' }) => {
  let href = data.linkHref?.[0]?.['@id'] || '';
  const isEditMode = mode === 'edit';
  const classNames = cx('ui button btn-block', data.btnStyle || 'primary');

  return isInternalURL(href) ? (
    isEditMode ? (
      <div className={classNames}>{data.linkTitle || href}</div>
    ) : (
      <ConditionalLink
        to={flattenToAppURL(href)}
        condition={!isEditMode}
        className={classNames}
      >
        {data.linkTitle || href}
      </ConditionalLink>
    )
  ) : href ? (
    <UniversalLink href={href} className={classNames}>
      {data.linkTitle || href}
    </UniversalLink>
  ) : isEditMode ? (
    'Button block'
  ) : null;
};
export default ButtonView;
