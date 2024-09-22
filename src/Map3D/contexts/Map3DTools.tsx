import React from "react";
import { createContext, useContext, FC, useState  } from "react";

interface Context {
  cesiumMeasure: any;
  setCesiumMeasure: (measure: any) => void;
  cesiumViewshed: any;
  setCesiumViewshed: (viewshed: any) => void;
  setActiveTool: (toolName: string | null) => void;
  activeTool: string | null;
}

interface Props {
  children: React.ReactNode;
}

const MapToolsContext = createContext<Context>({
  cesiumMeasure: null,
  setCesiumMeasure: () => {},
  cesiumViewshed: null,
  setCesiumViewshed: () => {},
  setActiveTool: () => {},
  activeTool: null
});

const MapToolsProvider: FC<Props> = ({ children }) => {
  const [activeTool, setActiveToolState] = useState<string | null>(null);
  var cesiumMeasure: any = null;
  const setCesiumMeasure = (measure: any) => (cesiumMeasure = measure);
  var cesiumViewshed: any = null;
  const setCesiumViewshed = (viewshed: any) => (cesiumViewshed = viewshed);

  const setActiveTool = (toolName: string | null) => {
    setActiveToolState(toolName);
    deactiveTools();
    clearDrawing();
    switch (toolName) {
      case "clean":
        return;
      case "area":
        return cesiumMeasure.setActiveMeasure("area");
      case "distance":
        return cesiumMeasure.setActiveMeasure("distance");
      case "viewshed":
        return cesiumViewshed.setActive(true);
      case "identify":
        return;
      case null:
        return;
      default:
        throw new Error("Not Found Tool");
    }
  };

  const deactiveTools = () => {
    cesiumMeasure.setActiveMeasure(null);
    cesiumViewshed.setActive(false);
  };

  const clearDrawing = () => {
    cesiumMeasure.clean();
    cesiumViewshed.clean();
  };

  return (
    <MapToolsContext.Provider
      value={{
        cesiumMeasure,
        setCesiumMeasure,
        cesiumViewshed,
        setCesiumViewshed,
        setActiveTool,
        activeTool
      }}
    >
      {children}
    </MapToolsContext.Provider>
  );
};

export default MapToolsProvider;

export const useMapTools = () => useContext(MapToolsContext);
