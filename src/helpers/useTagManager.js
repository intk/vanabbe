import React from 'react';
import TagManager from 'react-gtm-module';
import config from '@plone/volto/registry';
import { useLocation } from 'react-router-dom';

const useTagManager = ({ gtmId }) => {
  React.useEffect(() => {
    TagManager.initialize({ gtmId });
  }, [gtmId]);
};

export const GTMTracker = () => {
  useLocation();
  useTagManager({ gtmId: config.settings.gtmId });
  return null;
};

export default useTagManager;
