import React, { useCallback } from "react";
import Tool from "../Tool";
import { useMain } from "../../../contexts/MainContext";

const ResetNorth: React.FC = () => {
  const { map } = useMain();

  const handleAction = useCallback(() => {
    if (map) {
      map.easeTo({
        pitch: 0,
        bearing: 0,
      });
    }
  }, [map]);

  return (
    <Tool
      id="tool-resetNorth"
      image="/images/icon-north-black.svg"
      tooltip="Resetar orientação do mapa"
      onClick={handleAction}
      active={true}
      inUse={false}
    />
  );
};

export default ResetNorth;