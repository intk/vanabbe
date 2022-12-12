import React from 'react';
import './style.less';
import { useAtom } from 'jotai';
import { contrastModeAtom } from './../../../state';

const ContrastToggle = () => {
  const [contrastMode, setContrastMode] = useAtom(contrastModeAtom);

  const toggleContrastMode = () => setContrastMode(!contrastMode);

  return (
    <div className="contrast-toggle">
      Contrast
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={contrastMode}
          onChange={toggleContrastMode}
        />
        <span className="switch" />
      </label>
    </div>
  );
};

export default ContrastToggle;
