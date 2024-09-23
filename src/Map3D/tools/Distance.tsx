import { FC, useCallback } from "react";
import Tool from "./Tool";
import { useMapTools } from "../contexts/Map3DTools";

type Props = {
  pos: { right?: number; top?: number; left?: number; bottom?: number };
};

const Distance: FC<Props> = ({ pos }) => {
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
      pos={pos}
      onClick={handleTool}
    />
  );
};

export default Distance;
