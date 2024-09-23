import { useCallback, FC } from "react";
import Tool from "./Tool";
import { useMapTools } from "../contexts/Map3DTools";

type Props = {
  pos: { right?: number; top?: number; left?: number; bottom?: number };
};

const Clean: FC<Props> = ({ pos }) => {
  const { setActiveTool, activeTool } = useMapTools();

  const handleTool = useCallback(() => {
      setActiveTool(activeTool === "clean" ? null : "clean");
  }, [activeTool, setActiveTool]);

  return (
    <Tool
      image="/images/icon-clear.svg"
      active={true}
      inUse={activeTool === "clean"}
      pos={pos}
      onClick={handleTool}
    />
  );
};

export default Clean;
