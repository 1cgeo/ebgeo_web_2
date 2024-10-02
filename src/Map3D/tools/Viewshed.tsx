import { FC, useCallback } from "react";
import Tool from "./Tool";
import { useMapTools } from "../contexts/Map3DTools";

const Viewshed: FC = () => {
  const { setActiveTool, activeTool, areToolsEnabled } = useMapTools();

  const handleTool = useCallback(() => {
    setActiveTool("viewshed");
  }, []);

  return (
    <Tool
      image="/images/icon-viewshed.svg"
      active={true}
      inUse={activeTool === "viewshed"}
      disabled={!areToolsEnabled}
      tooltip="Analisar visibilidade"
      onClick={handleTool}
    />
  );
};

export default Viewshed;
