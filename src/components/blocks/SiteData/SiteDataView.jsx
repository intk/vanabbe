import React from 'react';
import { SocialLinks } from '@package/components';
import { Address } from '@package/components/theme/Footer/Footer';
import './style.css';

const SiteDataView = (props) => {
  const { data } = props;
  return (
    <div className="site-data-preview">
      <h3>Site data</h3>
      <Address {...data} />
      <h3>Social links</h3>

      <SocialLinks {...data} />
    </div>
  );
};

export default SiteDataView;
