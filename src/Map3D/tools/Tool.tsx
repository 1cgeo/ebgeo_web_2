import Box from "@mui/material/Box";
import { FC } from "react";

type Props = {
  image: string;
  active: boolean;
  inUse?: boolean;
  pos: { right?: number; top?: number; left?: number; bottom?: number };
  onClick: () => void;
};

const Tool: FC<Props> = ({ image, active, pos, onClick }) => (
  <Box
    component="img"
    src={image}
    sx={{
      display: active ? "" : "none",
      ...pos,
      width: 40,
      zIndex: 1000,
      cursor: "pointer",
    }}
    onClick={onClick}
  />
);
export default Tool;
