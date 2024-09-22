import { FC, useCallback } from "react";
import Tool from "./Tool";
import { useMapTools } from "../contexts/Map3DTools";

type Props = {
  pos: { right?: number; top?: number; left?: number; bottom?: number };
};

const Distance: FC<Props> = ({ pos }) => {
  const { setActiveTool, activeTool } = useMapTools();

  const handleTool = useCallback(() => {
    setActiveTool(activeTool === "distance" ? null : "distance");
  }, [activeTool, setActiveTool]);

  return (
    <Tool
      image="/images/icon-distance.svg"
      active={true}
      inUse={activeTool === "distance"}
      pos={pos}
      onClick={handleTool}
    />
  );
};

export default Distance;
