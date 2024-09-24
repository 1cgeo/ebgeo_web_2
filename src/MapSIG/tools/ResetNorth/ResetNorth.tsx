import { useEffect, useState, useCallback, FC } from "react";
import Tool from "../Tool";
import { useMain } from "../../../contexts/MainContext";

const ResetNorth: FC = () => {
  const { map } = useMain();

  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    if (!map) return;
    setActive(true);
    return () => {
      setActive(false);
    };
  }, [map]);

  const resetNorth = useCallback(() => {
    map.easeTo({
      pitch: 0,
      bearing: 0,
    });
  }, [map]);

  return (
    <Tool
      image="/images/icon-north-black.svg"
      active={active}
      onClick={resetNorth}
    />
  );
};

export default ResetNorth;
