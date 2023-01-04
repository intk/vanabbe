import React from 'react';
import { SocialLinks } from '@package/components';
import { Address } from '@package/components/theme/Footer/Footer';
import './style.css';

const SiteDataView = (props) => {
  const { data } = props;
  return (
    <div className="site-data-preview">
      <h5>Site data</h5>
      <Address {...data} />
      <h5>Social links</h5>

      <SocialLinks {...data} />
    </div>
  );
};

export default SiteDataView;
