import React from 'react';
import { useAtom } from 'jotai';
import { contrastModeAtom } from './../../../state';

const SiteThemeView = (props) => {
  const { data, mode = 'view', selected = false } = props;
  const { theme } = data;
  const [contrastMode] = useAtom(contrastModeAtom);

  React.useEffect(() => {
    if (mode !== 'edit') return;

    if (!theme) return;

    const siteTheme = contrastMode
      ? 'contrast-mode'
      : theme
      ? theme
      : 'default';

    if (selected) document.body.setAttribute('data-theme', siteTheme);
  }, [contrastMode, theme, mode, selected]);

  return null;
};

export default SiteThemeView;
