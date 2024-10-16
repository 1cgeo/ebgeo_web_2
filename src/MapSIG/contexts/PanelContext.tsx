import { createContext, useContext, FC } from "react";
import { useState } from "react";
import {
  PanelContextProps,
  PanelProviderProps
} from "../../ts/interfaces/mapSig.interfaces";
import {
  PanelType
} from "../../ts/types/mapSig.types";


const PanelContext = createContext<PanelContextProps>({
  openPanel: null,
  setOpenPanel: () => {},
});

const PanelProvider: FC<PanelProviderProps> = ({ children }) => {
  const [openPanel, setOpenPanel] = useState<PanelType>(null);

  const context = {
    openPanel,
    setOpenPanel,
  };

  return (
    <PanelContext.Provider value={context}>{children}</PanelContext.Provider>
  );
};

export default PanelProvider;

export const usePanel = () => useContext(PanelContext);