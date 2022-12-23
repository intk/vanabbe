import React from 'react';
import { useAtom } from 'jotai';
import { contrastModeAtom } from './../../../state';
import { useLocation } from 'react-router-dom';

const SiteTheme = (props) => {
  const { content } = props;
  const location = useLocation();
  const [contrastMode] = useAtom(contrastModeAtom);
  const [siteTheme, setSiteTheme] = React.useState('default');
  const [hasPageTheme, setHasPageTheme] = React.useState();
  const siteThemeBlockId = content?.blocks
    ? Object.keys(content?.blocks).find(
        (id) => content?.blocks?.[id]?.['@type'] === 'siteTheme',
      )
    : {};
  const pageTheme = content?.blocks?.[siteThemeBlockId]?.theme;

  React.useEffect(() => {
    setHasPageTheme(false);
  }, [location]);

  React.useEffect(() => {
    pageTheme ? setHasPageTheme(true) : setHasPageTheme(false);
  }, [pageTheme]);

  React.useEffect(() => {
    if (hasPageTheme) return null;

    if (contrastMode) {
      setSiteTheme('contrast-mode');
    } else {
      setSiteTheme('default');
    }
  }, [contrastMode, hasPageTheme]);

  React.useEffect(() => {
    if (hasPageTheme) return null;
    document.body.setAttribute('data-theme', siteTheme);
  }, [hasPageTheme, siteTheme]);

  return null;
};

export default SiteTheme;
