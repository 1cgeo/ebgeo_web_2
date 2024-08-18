import React, { useRef, useEffect } from 'react';
import { use3DStore } from '../stores/3dStore';

function ThreeDView() {
  const containerRef  = useRef(null);
  const initializeViewer = use3DStore(state => state.initializeViewer);

  useEffect(() => {
    if (containerRef.current) {
      initializeViewer(containerRef.current);
    }

    return () => {
      // Clean up when the component unmounts
      use3DStore.getState().cleanupViewer();
    };
  }, [initializeViewer]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '100%' }}
    />
  );
}

export default ThreeDView;