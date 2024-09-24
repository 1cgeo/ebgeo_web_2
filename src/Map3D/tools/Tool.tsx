import { FC } from "react";
import { IconButton } from "@mui/material";
import styled from "styled-components";

interface StyledIconButtonProps {
  $inUse?: boolean;
  $disabled?: boolean;
}

const StyledIconButton = styled(IconButton)<StyledIconButtonProps>`
  width: 32px;
  height: 32px;
  padding: 4px;
  background-color: ${props => props.$inUse ? '#e0e0e0' : 'transparent'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  &:hover {
    background-color: ${props => props.$disabled ? 'transparent' : '#f0f0f0'};
  }
`;

type Props = {
  image: string;
  active: boolean;
  inUse?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

const Tool: FC<Props> = ({ image, active, inUse, disabled, onClick }) => (
  <StyledIconButton
    onClick={onClick}
    disabled={disabled || !active}
    $inUse={inUse}
    $disabled={disabled}
  >
    <img src={image} alt="tool icon" style={{ width: '100%', height: '100%' }} />
  </StyledIconButton>
);

export default Tool;