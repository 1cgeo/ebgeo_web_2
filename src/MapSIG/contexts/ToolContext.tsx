import * as React from "react";
import { createContext, useContext, FC } from "react";
import { useState } from "react";

export type ToolType = 'text' | 'resetNorth' | 'featureSearch' | 'vectorTileInfo' | null;

interface Tool_Context {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

interface Props {
  children: React.ReactNode;
}

const ToolContext = createContext<Tool_Context>({
  activeTool: null,
  setActiveTool: () => {},
});

const ToolProvider: FC<Props> = ({ children }) => {
  const [activeTool, setActiveTool] = useState<ToolType>(null);

  const context = {
    activeTool,
    setActiveTool,
  };

  return (
    <ToolContext.Provider value={context}>{children}</ToolContext.Provider>
  );
};

export default ToolProvider;

export const useTool = () => useContext(ToolContext);