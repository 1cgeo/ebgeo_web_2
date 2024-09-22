import * as React from "react";
import { createContext, useContext, FC } from "react";
import { useState } from "react";

type PanelType = 'featureSearch' | 'vectorTileInfo' | 'textAttributes' | null;

interface Panel_Context {
  openPanel: PanelType;
  setOpenPanel: (panel: PanelType) => void;
}

interface Props {
  children: React.ReactNode;
}

const PanelContext = createContext<Panel_Context>({
  openPanel: null,
  setOpenPanel: () => {},
});

const PanelProvider: FC<Props> = ({ children }) => {
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