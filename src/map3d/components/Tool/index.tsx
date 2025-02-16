// Path: map3d\components\Tool\index.tsx
import { Tooltip } from '@mui/material';

import React, { type FC } from 'react';

import { StyledIconButton } from './styles';

interface ToolProps {
  image?: string;
  icon?: React.ReactNode;
  active: boolean;
  inUse?: boolean;
  disabled?: boolean;
  onClick: () => void;
  tooltip: string;
  drawerMode?: boolean;
}

export const Tool: FC<ToolProps> = ({
  image,
  icon,
  active,
  inUse,
  disabled,
  onClick,
  tooltip,
  drawerMode = false,
}) => {
  const content = (
    <StyledIconButton
      onClick={onClick}
      disabled={disabled || !active}
      $active={inUse}
      $disabled={disabled}
      $drawerMode={drawerMode}
    >
      {image ? (
        <img
          src={image}
          alt="tool icon"
          style={{ width: '100%', height: '100%' }}
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
    <Tooltip title={tooltip} placement="left">
      {content}
    </Tooltip>
  );
};
