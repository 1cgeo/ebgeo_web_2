import { FC, useCallback } from "react";
import Tool from "./Tool";
import { useMapTools } from "../contexts/Map3DTools";

const Viewshed: FC = () => {
  const { setActiveTool, activeTool, areToolsEnabled } = useMapTools();

  const handleTool = useCallback(() => {
    if (areToolsEnabled) {
      setActiveTool(activeTool === "viewshed" ? null : "viewshed");
    }
  }, [activeTool, setActiveTool, areToolsEnabled]);

  return (
    <Tool
      image="/images/icon-viewshed.svg"
      active={true}
      inUse={activeTool === "viewshed"}
      disabled={!areToolsEnabled}
      onClick={handleTool}
    />
  );
};

export default Viewshed;
