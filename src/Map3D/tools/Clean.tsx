import { useCallback, FC } from "react";
import Tool from "./Tool";
import { useMapTools } from "../contexts/Map3DTools";

const Clean: FC = () => {
  const { setActiveTool, activeTool, areToolsEnabled } = useMapTools();

  const handleTool = useCallback(() => {
    if (areToolsEnabled) {
      setActiveTool(activeTool === "clean" ? null : "clean");
    }
  }, [activeTool, setActiveTool, areToolsEnabled]);

  return (
    <Tool
      image="/images/icon-clear.svg"
      active={true}
      inUse={activeTool === "clean"}
      disabled={!areToolsEnabled}
      tooltip="Limpar medições e análises"
      onClick={handleTool}
    />
  );
};

export default Clean;
