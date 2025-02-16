import React, { type FC } from 'react';
import { Tooltip } from '@mui/material';
import { StyledIconButton } from './styles';

interface ToolProps {
  image?: string;
  icon?: React.ReactNode;
  active: boolean;
  inUse?: boolean;
  disabled?: boolean;
  onClick: () => void;
  tooltip: string;
}

export const Tool: FC<ToolProps> = ({
  image,
  icon,
  active,
  inUse,
  disabled,
  onClick,
  tooltip,
}) => {
  const content = (
    <StyledIconButton
      onClick={onClick}
      disabled={disabled || !active}
      $active={inUse}
      $disabled={disabled}
    >
      {image ? (
        <img 
          src={image} 
          alt="tool icon" 
          style={{ width: '100%', height: '100%' }} 
        />
      ) : icon}
    </StyledIconButton>
  );

  if (disabled) {
    return <span>{content}</span>;
  }

  return (
    <Tooltip title={tooltip} placement="left">
      {content}
    </Tooltip>
  );
};