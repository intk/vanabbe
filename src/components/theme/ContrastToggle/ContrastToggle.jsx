import React, { useState } from 'react';
import './style.less';

const ContrastToggle = () => {
  const [toggle, setToggle] = useState(false);

  const onToggle = () => setToggle(!toggle);

  return (
    <div className="contrast-toggle">
      Contrast
      <label className="toggle-switch">
        <input type="checkbox" checked={toggle} onChange={onToggle} />
        <span className="switch" />
      </label>
    </div>
  );
};

export default ContrastToggle;
