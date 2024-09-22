import { FC, useCallback } from "react";
import Tool from "./Tool";
import { useMapTools } from "../contexts/Map3DTools";

type Props = {
  pos: { right?: number; top?: number; left?: number; bottom?: number };
};

const Viewshed: FC<Props> = ({ pos }) => {
  const { setActiveTool, activeTool } = useMapTools();

  const handleTool = useCallback(() => {
    setActiveTool(activeTool === "viewshed" ? null : "viewshed");
  }, [activeTool, setActiveTool]);

  return (
    <Tool
      image="/images/icon-viewshed.svg"
      active={true}
      inUse={activeTool === "viewshed"}
      pos={pos}
      onClick={handleTool}
    />
  );
};

export default Viewshed;
