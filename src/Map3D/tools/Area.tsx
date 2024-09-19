import { useState, FC, useCallback } from "react";
import Tool from "./Tool";
import { useMapTools } from "../contexts/MapTools";

type Props = {
  pos: { right?: number; top?: number; left?: number; bottom?: number };
};

const Area: FC<Props> = ({ pos }) => {
  const { setActiveTool } = useMapTools();
  const [active] = useState<boolean>(true);

  const handleTool = useCallback(() => {
    setActiveTool("area");
  }, []);

  return (
    <Tool
      image="/images/icon-area.svg"
      active={active}
      pos={pos}
      onClick={handleTool}
    />
  );
};

export default Area;
