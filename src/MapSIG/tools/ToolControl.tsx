import React, { useCallback, useMemo } from 'react';
import { useTool, ToolType } from '../contexts/ToolContext';
import { useSelection } from '../contexts/SelectionContext';
import Tool from './Tool';

interface ToolControlProps {
  name: ToolType;
  icon: string;
  tooltip: string;
  children?: React.ReactNode;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

const ToolControl: React.FC<ToolControlProps> = ({
  name,
  icon,
  tooltip,
  children,
  onActivate,
  onDeactivate
}) => {
  const { activeTool, setActiveTool } = useTool();
  const { clearSelection } = useSelection();

  const handleToolClick = useCallback(() => {
    if (activeTool === name) {
      setActiveTool(null);
      onDeactivate?.();
    } else {
      setActiveTool(name);
      clearSelection();
      onActivate?.();
    }
  }, [activeTool, name, setActiveTool, clearSelection, onActivate, onDeactivate]);

  const isActive = useMemo(() => activeTool === name, [activeTool, name]);

  return (
    <>
      <Tool
        id={`tool-${name}`}
        image={icon}
        active={true}
        inUse={isActive}
        tooltip={tooltip}
        onClick={handleToolClick}
      />
      {isActive && children}
    </>
  );
};

export default ToolControl;