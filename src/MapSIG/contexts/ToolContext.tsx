import { createContext, useContext, FC } from "react";
import { useState } from "react";
import {
  ToolContextProps,
  ToolProviderProps,
} from "../../ts/interfaces/mapSig.interfaces";
import { ToolType } from "../../ts/types/mapSig.types";

const ToolContext = createContext<ToolContextProps>({
  activeTool: null,
  setActiveTool: () => {},
});

const ToolProvider: FC<ToolProviderProps> = ({ children }) => {
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
