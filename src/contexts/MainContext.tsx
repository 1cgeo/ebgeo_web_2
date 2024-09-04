import * as React from "react";
import { createContext, useContext, FC } from "react";
import { useState } from "react";

interface Context {
  mapLibre: any;
  setMapLibre: (map: any) => void;
  cesium: any;
  setCesium: (map: any) => void;
}

interface Props {
  children: React.ReactNode;
}

const MainContext = createContext<Context>({
  mapLibre: null,
  setMapLibre: () => {},
  cesium: null,
  setCesium: () => {},
});

const MainContextProvider: FC<Props> = ({ children }) => {
  const [mapLibre, setMapLibre] = useState<any>(null);
  const [cesium, setCesium] = useState<any>(null);

  return (
    <MainContext.Provider
      value={{
        mapLibre,
        setMapLibre,
        cesium,
        setCesium,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export default MainContextProvider;

export const useMain = () => useContext(MainContext);
