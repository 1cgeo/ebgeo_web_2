import { FC } from "react";
import { Box } from "@mui/material";
import styled from "styled-components";

const Background = styled(Box)({
  backgroundColor: "white",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "8px",
  gap: 10,
  alignItems: "center",
  zIndex: 1,
  position: "absolute",
  top: "120px",
  right: "5px",
  borderRadius: "13px",
});

type Props = {
  tools: Array<FC>;
  start: number;
};

export default ({ tools, start = 0 }: Props) => {
  return (
    <Background
      sx={{
        height: `${tools.length * 55}px`,
      }}
    >
      {tools.map((tool: FC, index) => {
        const pos = {
          top: start + index * 70,
          right: 10,
        };

        return tool(pos);
      })}
    </Background>
  );
};