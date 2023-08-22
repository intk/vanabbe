import React from 'react';
import cx from 'classnames';
import { LinkMore } from '@plone/volto/components';

import './facts.less';

const Card = ({ title, subtitle }) => {
  return (
    <div className={cx('fact-card', {})}>
      <div className="title">{title}</div>
      <div className="subtitle">{subtitle}</div>
    </div>
  );
};

const FactsView = (props) => {
  const { data = {} } = props;
  const { linkHref, title, cards = [] } = data;

  return (
    <div className="facts-grid">
      {!!title && (
        <div className="facts-grid-block-title">
          <h2>{title}</h2>
          {linkHref ? <LinkMore data={data} /> : ''}
        </div>
      )}
      <div className="facts">
        {cards?.map((card, i) => (
          <Card key={card.id} title={card.title} subtitle={card.subtitle} />
        ))}
      </div>
      {cards?.length < 1 && 'Nothing yet'}
    </div>
  );
};

export default FactsView;
