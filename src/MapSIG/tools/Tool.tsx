import React from "react";
import { IconButton } from "@mui/material";
import styled from "styled-components";
import Tooltip from "@mui/material/Tooltip";
import {
  StyledIconButtonProps,
  ToolProps,
} from "../../ts/interfaces/mapSig.interfaces";

const StyledIconButton = styled(IconButton)<StyledIconButtonProps>`
  width: 32px;
  height: 32px;
  padding: 4px;
  background-color: ${(props) => (props.$inUse ? "#e0e0e0" : "transparent")};
  &:hover {
    background-color: #f0f0f0;
  }
`;

const Tool: React.FC<ToolProps> = ({
  image,
  active,
  inUse,
  onClick,
  tooltip,
  id,
}) => {
  const button = (
    <StyledIconButton
      onClick={onClick}
      disabled={!active}
      $inUse={inUse}
      id={id}
    >
      <img
        src={image}
        alt="tool icon"
        style={{ width: "100%", height: "100%" }}
      />
    </StyledIconButton>
  );

  return (
    <Tooltip title={tooltip} placement="left">
      {active ? (
        button
      ) : (
        <span style={{ display: "inline-block" }}>{button}</span>
      )}
    </Tooltip>
  );
};

export default Tool;
