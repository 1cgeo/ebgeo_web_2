import * as React from "react";
import { createContext, useContext, FC } from "react";
import { useState } from "react";

interface Context {
  map: any;
  setMap: (map: any) => void;
  cesium: any;
  setCesium: (map: any) => void;
  maplibregl: any;
  setMapLibregl: (map: any) => void;
}

interface Props {
  children: React.ReactNode;
}

const MainContext = createContext<Context>({
  map: null,
  setMap: () => {},
  cesium: null,
  setCesium: () => {},
  maplibregl: null,
  setMapLibregl: () => {}
});

const MainContextProvider: FC<Props> = ({ children }) => {
  const [map, setMap] = useState<any>(null);
  const [cesium, setCesium] = useState<any>(null);
  const [maplibregl, setMapLibregl] = useState<any>(null);

  return (
    <MainContext.Provider
      value={{
        map,
        setMap,
        cesium,
        setCesium,
        maplibregl,
        setMapLibregl
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export default MainContextProvider;

export const useMain = () => useContext(MainContext);
