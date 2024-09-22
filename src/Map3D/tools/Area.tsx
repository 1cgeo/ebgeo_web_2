import { FC, useCallback } from "react";
import Tool from "./Tool";
import { useMapTools } from "../contexts/Map3DTools";

type Props = {
  pos: { right?: number; top?: number; left?: number; bottom?: number };
};

const Area: FC<Props> = ({ pos }) => {
  const { setActiveTool, activeTool } = useMapTools();

  const handleTool = useCallback(() => {
    setActiveTool(activeTool === "area" ? null : "area");
  }, [activeTool, setActiveTool]);

  return (
    <Tool
      image="/images/icon-area.svg"
      active={true}
      inUse={activeTool === "area"}
      pos={pos}
      onClick={handleTool}
    />
  );
};

export default Area;
