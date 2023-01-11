import React from 'react';
import loadable from '@loadable/component';
import PropTypes from 'prop-types';
import { LinkMore } from '@plone/volto/components';
import { UniversalLink } from '@plone/volto/components';
import { Container } from 'semantic-ui-react';
import { ResponsiveContainer, ListingBlockHeader } from '@package/components';
import { useWindowDimensions } from '@package/helpers';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import Card from './ListingCard';
import './less/colored-cards.less';

const Slider = loadable(() => import('react-slick'));

const BREAKPOINT = 1000;

const ColoredCardsTemplate = (props) => {
  const { items, linkHref, linkTitle } = props;
  const { windowWidth } = useWindowDimensions();

  const sliderRef = React.useRef();

  const carouselSettings = React.useMemo(
    () => ({
      dots: true,
      arrows: false,
      lazyLoad: 'progressive',
      autoplay: false,
      infinite: true,
      // centerMode: true,
      variableWidth: true,
    }),
    [],
  );

  return (
    <>
      <div className="listing-header">
        <ListingBlockHeader data={props} />

        {linkHref && (
          <UniversalLink href={linkHref?.[0]['@id']}>
            {linkTitle || '...'}
          </UniversalLink>
        )}
      </div>

      {windowWidth > BREAKPOINT ? (
        <div className="colored-cards-listing">
          <Container>
            <div className="listings colored-cards">
              <div className="listings ">
                {items.map((item, i) => (
                  <div className="listing-column" key={i}>
                    <Card item={item} {...props} />
                  </div>
                ))}
              </div>
            </div>
            {props.linkHref ? <LinkMore data={props} /> : ''}
          </Container>
        </div>
      ) : (
        <div className="colored-cards-slider">
          <ResponsiveContainer>
            {({ parentWidth }) =>
              parentWidth ? (
                <div style={{ width: `${parentWidth}px`, margin: '0 auto' }}>
                  <Slider
                    ref={sliderRef}
                    {...carouselSettings}
                    className="slick-carousel slider-listing"
                  >
                    {items.map((item, i) => (
                      <Card item={item} key={i} {...props} />
                    ))}
                  </Slider>
                </div>
              ) : (
                ''
              )
            }
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
};

ColoredCardsTemplate.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default ColoredCardsTemplate;
