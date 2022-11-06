import { useState, useEffect } from 'react';

export default function useWindowDimensions() {
  function getWindowDimensions() {
    const hasWindow = typeof window !== 'undefined';
    const windowWidth = hasWindow ? window.innerWidth : null;
    const windowHeight = hasWindow ? window.innerHeight : null;
    return {
      windowWidth,
      windowHeight,
    };
  }
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions(),
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}
