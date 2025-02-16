// Path: mapSig\features\baseMapToggle\BaseMapToggleControl\PreviewButton.tsx
import { Tooltip } from '@mui/material';

import { type FC } from 'react';

import { PreviewButtonContainer, StyledPreviewButton } from './styles';

interface PreviewButtonProps {
  isOrtho: boolean;
  onClick: () => void;
}

export const PreviewButton: FC<PreviewButtonProps> = ({ isOrtho, onClick }) => {
  const tooltipText = isOrtho
    ? 'Mudar mapa para carta topográfica'
    : 'Mudar mapa para carta ortoimagem';

  return (
    <PreviewButtonContainer>
      <Tooltip title={tooltipText} placement="right">
        <StyledPreviewButton $isOrtho={isOrtho} onClick={onClick} />
      </Tooltip>
    </PreviewButtonContainer>
  );
};
