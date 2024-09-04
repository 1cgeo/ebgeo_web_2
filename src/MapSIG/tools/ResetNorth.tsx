import { useEffect, useState, useCallback, FC } from "react";
import Tool from "./Tool";
import { useMain } from "../../contexts/MainContext";

type Props = {
  pos: { right?: number; top?: number; left?: number; bottom?: number };
};

const ResetNorth: FC<Props> = ({ pos }) => {
  const { mapLibre: map } = useMain();

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
      pos={pos}
      onClick={resetNorth}
    />
  );
};

export default ResetNorth;
