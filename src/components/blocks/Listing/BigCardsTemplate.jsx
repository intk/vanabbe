import React from 'react';
import PropTypes from 'prop-types';
import { LinkMore } from '@plone/volto/components';
import { Grid } from 'semantic-ui-react';
import { ListingBlockHeader } from '@package/components';

import Card from './ListingBigCard';

const BigCardsTemplate = (props) => {
  const { items } = props;

  return (
    <>
      <ListingBlockHeader data={props} />
      <div className="listings big-cards">
        <Grid columns={4} className="listings">
          {items.map((item, i) => (
            <React.Fragment key={i}>
              {items.length < 2 ? (
                <Grid.Column computer={12} className="listing-column-one">
                  <Card item={item} {...props} />
                </Grid.Column>
              ) : (
                <Grid.Column computer={6} className="listing-column" key={i}>
                  <Card item={item} {...props} />
                </Grid.Column>
              )}
            </React.Fragment>
          ))}
        </Grid>
      </div>
      {props.linkHref ? <LinkMore data={props} /> : ''}
    </>
  );
};

BigCardsTemplate.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default BigCardsTemplate;
