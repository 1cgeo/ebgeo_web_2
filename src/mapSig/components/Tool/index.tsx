// Path: mapSig\components\Tool\index.tsx
import { Tooltip } from '@mui/material';

import React, { type FC } from 'react';

import { StyledIconButton } from './styles';

interface ToolProps {
  // Props de identificação e conteúdo
  image?: string;
  icon?: React.ReactNode;
  tooltip: string;

  // Props de estado
  active: boolean;
  inUse?: boolean;
  disabled?: boolean;
  drawerMode?: boolean;

  // Handlers
  onClick: () => void;

  // Props de estilo
  tooltipPlacement?: 'left' | 'right' | 'top' | 'bottom';
}

export const Tool: FC<ToolProps> = ({
  image,
  icon,
  tooltip,
  active,
  inUse,
  disabled,
  drawerMode = false,
  onClick,
  tooltipPlacement = 'left',
}) => {
  const content = (
    <StyledIconButton
      onClick={onClick}
      disabled={disabled || !active}
      $active={inUse}
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

  // No modo drawer ou quando desabilitado, retornamos o botão sem tooltip
  if (disabled || drawerMode) {
    return content;
  }

  return (
    <Tooltip title={tooltip} placement={tooltipPlacement} arrow>
      {/* Wrapper div necessário para o Tooltip funcionar com botão disabled */}
      <span>{content}</span>
    </Tooltip>
  );
};
