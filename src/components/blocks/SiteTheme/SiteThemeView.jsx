import React from 'react';
import config from '@plone/volto/registry';

const getRandomTheme = (themes) => {
  const theme = Object.values(themes);
  const randomTheme = theme[Math.floor(Math.random() * theme.length)].value;
  return randomTheme;
};

const SiteThemeView = (props) => {
  const { siteThemes } = config.settings;
  const { theme } = props.data;
  const [siteTheme, setSiteTheme] = React.useState('default');

  React.useEffect(() => {
    if (theme) setSiteTheme(theme);
  }, [theme]);

  React.useEffect(() => {
    document.body.setAttribute('data-theme', siteTheme);
  }, [siteTheme]);

  const handleTheme = (e) => {
    if (e.currentTarget !== e.target) return;
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
