import React from 'react';
import config from '@plone/volto/registry';
import { useAtom } from 'jotai';
import { contrastModeAtom } from './../../../state';

const getRandomTheme = (themes) => {
  const theme = Object.values(themes);
  const randomTheme = theme[Math.floor(Math.random() * theme.length)].value;
  return randomTheme;
};

const SiteThemeView = (props) => {
  const { siteThemes } = config.settings;
  const { theme } = props.data;
  const [siteTheme, setSiteTheme] = React.useState('default');
  const [contrastMode] = useAtom(contrastModeAtom);

  React.useEffect(() => {
    if (!theme) return;
    if (contrastMode) {
      setSiteTheme('contrast-mode');
    } else if (theme) {
      setSiteTheme(theme);
    } else {
      setSiteTheme('default');
    }
  }, [contrastMode, theme, siteTheme]);

  React.useEffect(() => {
    document.body.setAttribute('data-theme', siteTheme);
  }, [siteTheme]);

  const handleTheme = (e) => {
    if (e.currentTarget !== e.target && !contrastMode) return;
    setSiteTheme(getRandomTheme(siteThemes));
  };

  React.useEffect(() => {
    const view = document.getElementById('view');
    if (view) {
      view.addEventListener('dblclick', handleTheme);
      return () => view.removeEventListener('dblclick', handleTheme);
    }
  });

  return null;
};

export default SiteThemeView;
