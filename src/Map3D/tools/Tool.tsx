import Box from "@mui/material/Box";
import { FC } from "react";

type Props = {
  image: string;
  active: boolean;
  inUse?: boolean;
  disabled?: boolean;
  pos: { right?: number; top?: number; left?: number; bottom?: number };
  onClick: () => void;
};

const Tool: FC<Props> = ({ image, active, inUse, disabled, pos, onClick }) => (
  <Box
    component="img"
    src={image}
    sx={{
      display: active ? "" : "none",
      ...pos,
      width: 40,
      zIndex: 1000,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      filter: inUse ? "brightness(0.7)" : "none",
    }}
    onClick={disabled ? undefined : onClick}
  />
);

export default Tool;