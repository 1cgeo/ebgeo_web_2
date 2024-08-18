import React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@mui/material';
import NorthIcon from '@mui/icons-material/North';

class ResetNorthControl {
  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl';
    this._container.style.zIndex = 1000;
    this._container.style.pointerEvents = 'auto';

    // Create the React element
    const handleClick = () => {
      map.easeTo({
        pitch: 0,
        bearing: 0
      });
    };

    // Use createRoot API
    this._root = createRoot(this._container);
    this._root.render(
      <Button
        onClick={handleClick}
        title="Reset to North"
        style={{
          backgroundColor: 'white',
          margin: '10px',
          minWidth: '30px',
          width: '30px',
          height: '30px',
          padding: 0,
          zIndex: 1000,
        }}
      >
        <NorthIcon />
      </Button>
    );

    return this._container;
  }

  onRemove() {
    if (this._root) {
      // Delay the unmount to ensure it doesn't interfere with React's render process
      setTimeout(() => {
        this._root.unmount();
        if (this._container.parentNode) {
          this._container.parentNode.removeChild(this._container);
        }
        this._map = undefined;
      }, 0);
    }
  }
}

export default ResetNorthControl;