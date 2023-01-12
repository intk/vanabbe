import React from 'react';
import { useAtom } from 'jotai';
import { contrastModeAtom } from './../../../state';
import { useLocation } from 'react-router-dom';
import { isCmsUi } from '@plone/volto/helpers';
import config from '@plone/volto/registry';

const getRandomTheme = (themes) => {
  const theme = Object.values(themes);
  const randomTheme = theme[Math.floor(Math.random() * theme.length)].value;
  return randomTheme;
};

const SiteTheme = (props) => {
  const { content } = props;
  const { siteThemes } = config.settings;
  const pathname = useLocation().pathname;
  const cmsView = isCmsUi(pathname);
  const [contrastMode] = useAtom(contrastModeAtom);
  const [pageTheme, setPageTheme] = React.useState();
  const [initialPageTheme, setInitialPageTheme] = React.useState();
  const [hasSelectedPageTheme, setHasSelectedPageTheme] = React.useState();
  const siteThemeBlockId = content?.blocks
    ? Object.keys(content?.blocks).find(
        (id) => content?.blocks?.[id]?.['@type'] === 'siteTheme',
      )
    : null;
  const pageThemeBlock = content?.blocks?.[siteThemeBlockId]?.theme;

  React.useEffect(() => {
    if (hasSelectedPageTheme || siteThemeBlockId) return null;
    setInitialPageTheme(getRandomTheme(siteThemes));
  }, [hasSelectedPageTheme, siteThemeBlockId, siteThemes]);

  React.useEffect(() => {
    setHasSelectedPageTheme(false);
  }, [pathname]);

  React.useEffect(() => {
    if (pageThemeBlock) {
      setHasSelectedPageTheme(true);
    } else {
      setHasSelectedPageTheme(false);
    }
  }, [pageThemeBlock]);

  React.useEffect(() => {
    if (hasSelectedPageTheme) return null;

    if (contrastMode) {
      setPageTheme('contrast-mode');
    } else if (cmsView) {
      setPageTheme('default');
    } else {
      setPageTheme(initialPageTheme);
    }
  }, [cmsView, contrastMode, hasSelectedPageTheme, initialPageTheme]);

  React.useEffect(() => {
    if (hasSelectedPageTheme) return null;
    document.body.setAttribute('data-theme', pageTheme);
  }, [hasSelectedPageTheme, pageTheme]);

  return null;
};

export default SiteTheme;
