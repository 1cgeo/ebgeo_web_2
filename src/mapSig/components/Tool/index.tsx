// Path: mapSig\components\Tool\index.tsx
import { Tooltip } from '@mui/material';

import React, { type FC } from 'react';

import type { FeatureId } from '../../features/registry';
import { useMapSigStore } from '../../store';
import { StyledIconButton } from './styles';

interface ToolProps {
  // Identificação e conteúdo
  id: string;
  image?: string;
  icon?: React.ReactNode;
  tooltip: string;

  // Estado
  disabled?: boolean;
  drawerMode?: boolean;

  // Handlers
  onClick?: () => void;
}

export const Tool: FC<ToolProps> = ({
  id,
  image,
  icon,
  tooltip,
  disabled,
  drawerMode = false,
  onClick,
}) => {
  const { activeTool, setActiveTool } = useMapSigStore();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    setActiveTool((activeTool === id ? null : id) as FeatureId | null);
  };

  const isActive = activeTool === id;

  const content = (
    <StyledIconButton
      onClick={handleClick}
      disabled={disabled}
      $active={isActive}
      $disabled={disabled}
      $drawerMode={drawerMode}
      aria-label={tooltip}
    >
      {image ? (
        <img
          src={image}
          alt={tooltip}
          width={drawerMode ? 24 : 32}
          height={drawerMode ? 24 : 32}
        />
      ) : (
        icon
      )}
    </StyledIconButton>
  );

  if (disabled || drawerMode) {
    return content;
  }

  return (
    <Tooltip title={tooltip} placement="left" arrow>
      <span>{content}</span>
    </Tooltip>
  );
};
