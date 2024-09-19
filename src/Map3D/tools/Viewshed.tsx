import { FC, useCallback, useState } from "react";
import Tool from "./Tool";
import { useMapTools } from "../contexts/MapTools";

type Props = {
  pos: { right?: number; top?: number; left?: number; bottom?: number };
};

const Area: FC<Props> = ({ pos }) => {
  const { setActiveTool } = useMapTools();
  const [active] = useState<boolean>(true);

  const handleTool = useCallback(() => {
    setActiveTool("viewshed");
  }, []);

  return (
    <Tool
      image="/images/icon-viewshed.svg"
      active={active}
      pos={pos}
      onClick={handleTool}
    />
  );
};

export default Area;
