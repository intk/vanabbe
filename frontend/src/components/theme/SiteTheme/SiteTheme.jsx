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

const getContextPageTheme = (content) => {
  const siteThemeBlockId = content?.blocks
    ? Object.keys(content?.blocks).find(
        (id) => content?.blocks?.[id]?.['@type'] === 'siteTheme',
      )
    : null;
  const pageThemeBlock = content?.blocks?.[siteThemeBlockId]?.theme;
  return pageThemeBlock;
};

const SiteTheme = (props) => {
  /**
   * - we have a default theme, called "default"
   * - user navigates the website
   * - when they encounter content that defines a color, the website changes
   *   color
   * - the color stays the same until they meet another content with a color
   * - or they change the color manually by double-clicking
   */
  const { content } = props;
  const { siteThemes } = config.settings;
  const pathname = useLocation().pathname;
  const cmsView = isCmsUi(pathname);
  const [contrastMode] = useAtom(contrastModeAtom);

  const contextPageTheme = getContextPageTheme(content) || 'default';
  const [pageTheme, setPageTheme] = React.useState(contextPageTheme);

  React.useEffect(() => {
    const theme = contrastMode
      ? 'contrast-mode'
      : cmsView
      ? 'default'
      : contextPageTheme === 'default'
      ? pageTheme
      : contextPageTheme;

    if (theme !== contextPageTheme) {
      setPageTheme(theme);
    } else if (theme === 'default') {
      setPageTheme(getRandomTheme(siteThemes));
    }
    document.body.setAttribute('data-theme', theme);
  }, [cmsView, pageTheme, contrastMode, contextPageTheme]);

  React.useEffect(() => {
    function handleClick(event) {
      const main = document.querySelector('div#main');
      const view = document.querySelectorAll('div#view>*');

      if ([main, ...view].includes(event.target)) {
        setPageTheme(getRandomTheme(siteThemes));

        setTimeout(() => {
          if (document.selection && document.selection.empty) {
            document.selection.empty();
          } else if (window.getSelection) {
            var sel = window.getSelection();
            sel.removeAllRanges();
          }
        }, 50);

        event.preventDefault();
        event.stopPropagation();
      }
    }
    document.body.addEventListener('dblclick', handleClick);
    return () => document.body.removeEventListener('click', handleClick);
  }, [siteThemes]);

  return null;
};

export default SiteTheme;
