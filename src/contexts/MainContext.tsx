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
  cesiumMap: any;
  setCesiumMap: (map: any) => void;
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
  setMapLibregl: () => {},
  cesiumMap: null,
  setCesiumMap: () => {},
});

const MainContextProvider: FC<Props> = ({ children }) => {
  const [map, setMap] = useState<any>(null);
  const [maplibregl, setMapLibregl] = useState<any>(null);
  const [cesium, _setCesium] = useState<any>(null);
  const [cesiumMap, _setCesiumMap] = useState<any>(null);

  const setCesium = (cesium: any) => {
    _setCesium((prevCesium: any) => (prevCesium ? prevCesium : cesium));
  };

  const setCesiumMap = (cesiumMap: any) => {
    _setCesiumMap((prevCesiumMap: any) =>
      prevCesiumMap ? prevCesiumMap : cesiumMap
    );
  };

  return (
    <MainContext.Provider
      value={{
        map,
        setMap,
        cesium,
        setCesium,
        maplibregl,
        setMapLibregl,
        cesiumMap,
        setCesiumMap,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export default MainContextProvider;

export const useMain = () => useContext(MainContext);
