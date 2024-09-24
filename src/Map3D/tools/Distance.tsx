import { FC, useCallback } from "react";
import Tool from "./Tool";
import { useMapTools } from "../contexts/Map3DTools";

const Distance: FC = () => {
  const { setActiveTool, activeTool, areToolsEnabled } = useMapTools();

  const handleTool = useCallback(() => {
    if (areToolsEnabled) {
      setActiveTool(activeTool === "distance" ? null : "distance");
    }
  }, [activeTool, setActiveTool, areToolsEnabled]);

  return (
    <Tool
      image="/images/icon-distance.svg"
      active={true}
      inUse={activeTool === "distance"}
      disabled={!areToolsEnabled}
      onClick={handleTool}
    />
  );
};

export default Distance;
