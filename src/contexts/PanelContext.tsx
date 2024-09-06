import React, { createContext, useState, useContext } from 'react';

type PanelType = 'featureSearch' | 'vectorTileInfo' | null;

interface PanelContextType {
  openPanel: PanelType;
  setOpenPanel: (panel: PanelType) => void;
}

const PanelContext = createContext<PanelContextType | undefined>(undefined);

export const PanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openPanel, setOpenPanel] = useState<PanelType>(null);

  return (
    <PanelContext.Provider value={{ openPanel, setOpenPanel }}>
      {children}
    </PanelContext.Provider>
  );
};

export const usePanel = () => {
  const context = useContext(PanelContext);
  if (context === undefined) {
    throw new Error('usePanel must be used within a PanelProvider');
  }
  return context;
};