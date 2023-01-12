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

  React.useEffect(() => {
    function handleClick(event) {
      const main = document.querySelector('div#main');
      const view = document.querySelectorAll('div#view>*');

      if ([main, ...view].includes(event.target)) {
        setPageTheme(getRandomTheme(siteThemes));
      }
      event.preventDefault();
      event.stopPropagation();

      setTimeout(() => {
        if (document.selection && document.selection.empty) {
          document.selection.empty();
        } else if (window.getSelection) {
          var sel = window.getSelection();
          sel.removeAllRanges();
        }
      }, 50);
    }
    document.body.addEventListener('dblclick', handleClick);
    return () => document.body.removeEventListener('click', handleClick);
  }, [siteThemes]);

  return null;
};

export default SiteTheme;
