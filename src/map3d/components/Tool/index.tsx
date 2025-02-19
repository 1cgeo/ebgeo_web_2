// Path: map3d\components\Tool\index.tsx
import { Tooltip } from '@mui/material';

import React, { type FC } from 'react';

import type { FeatureId } from '../../features/registry';
import { useMap3DStore } from '../../store';
import { StyledIconButton } from './styles';

interface ToolProps {
  // Identificação e conteúdo
  id: string;
  image?: string;
  icon?: React.ReactNode;
  tooltip: string;
  active?: boolean;

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
  active: forcedActive,
  disabled: forcedDisabled,
  drawerMode = false,
  onClick,
}) => {
  const { activeTool, setActiveTool, areToolsEnabled } = useMap3DStore();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    setActiveTool((activeTool === id ? null : id) as FeatureId | null);
  };

  const isActive =
    forcedActive !== undefined ? forcedActive : activeTool === id;
  const isDisabled =
    forcedDisabled !== undefined
      ? forcedDisabled
      : !areToolsEnabled && id !== 'catalog' && id !== 'clean';

  const content = (
    <StyledIconButton
      onClick={handleClick}
      disabled={isDisabled}
      $active={isActive}
      $disabled={isDisabled}
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

  return (
    <Tooltip title={tooltip} placement="left" arrow>
      <span>{content}</span>
    </Tooltip>
  );
};
