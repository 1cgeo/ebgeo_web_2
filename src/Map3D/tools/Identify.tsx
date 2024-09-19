import { FC } from "react";
import Tool from "./Tool";

type Props = {
  pos: { right?: number; top?: number; left?: number; bottom?: number };
};

const Area: FC<Props> = ({ pos }) => {
  return (
    <Tool
      image="/images/icon-area.svg"
      active={true}
      pos={pos}
      onClick={() => {}}
    />
  );
};

export default Area;
