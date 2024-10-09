import { FC } from "react";
import { Box } from "@mui/material";
import styled from "styled-components";

const ToolbarContainer = styled(Box)`
  position: absolute;
  top: 150px;
  right: 10px;
  background-color: white;
  border-radius: 4px;
  padding: 8px;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  opacity: 0.9;
`;

const RightSideToolBar: FC<{ tools: Array<FC> }> = ({ tools }) => {
  return (
    <ToolbarContainer
      sx={{
        display: {
          sm: "flex",
          xs: "none",
        },
      }}
    >
      {tools.map((Tool, index) => (
        <Tool key={index} />
      ))}
    </ToolbarContainer>
  );
};

export default RightSideToolBar;
