import { FC, useCallback } from "react";
import Tool from "./Tool";
import { useMapTools } from "../contexts/Map3DTools";

const Area: FC = () => {
  const { setActiveTool, activeTool, areToolsEnabled } = useMapTools();

  const handleTool = useCallback(() => {
    setActiveTool("area");
  }, []);

  return (
    <Tool
      image="/images/icon-area.svg"
      active={true}
      inUse={activeTool === "area"}
      disabled={!areToolsEnabled}
      tooltip="Medir área"
      onClick={handleTool}
    />
  );
};

export default Area;
