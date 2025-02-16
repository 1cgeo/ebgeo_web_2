// Path: mapSig\features\baseMapToggle\BaseMapToggleControl\index.tsx
import { type FC } from 'react';

import { useBaseMapStore } from '../store';
import { PreviewButton } from './PreviewButton';

export const BaseMapToggleControl: FC = () => {
  const { currentStyle, toggleBaseMap } = useBaseMapStore();

  return (
    <PreviewButton isOrtho={currentStyle === 'orto'} onClick={toggleBaseMap} />
  );
};
