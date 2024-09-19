import { useState, useCallback, FC } from "react";
import Tool from "./Tool";
import { useMapTools } from "../contexts/MapTools";

type Props = {
  pos: { right?: number; top?: number; left?: number; bottom?: number };
};

const Area: FC<Props> = ({ pos }) => {
  const { setActiveTool } = useMapTools();
  const [active] = useState<boolean>(true);

  const handleTool = useCallback(() => {
    setActiveTool("clean");
  }, []);

  return (
    <Tool
      image="/images/icon-clear.svg"
      active={active}
      pos={pos}
      onClick={handleTool}
    />
  );
};

export default Area;
