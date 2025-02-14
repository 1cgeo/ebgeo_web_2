import { FC, useState } from "react";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Toolbar from "@mui/material/Toolbar";
import { ListItemButton, ListItemIcon } from "@mui/material";
import Model3DCatalog from "../catalog/Model3DCatalog";
import styled from "styled-components";

const StyledIcon = styled.img`
  width: 24px;
  height: 24px;
`;

interface Props {
  onClose: () => void;
}

const DrawerContent: FC<Props> = ({ onClose }) => {
  const [catalogOpen, setCatalogOpen] = useState(false);

  const handleCatalogClick = () => {
    setCatalogOpen(true);
    onClose(); // Fecha o drawer quando abre o catálogo
  };

  return (
    <div>
      <Toolbar />
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleCatalogClick}>
            <ListItemIcon>
              <StyledIcon src="/images/catalog.svg" alt="Catálogo 3D" />
            </ListItemIcon>
            Catálogo 3D
          </ListItemButton>
        </ListItem>
      </List>
      <Model3DCatalog 
        open={catalogOpen} 
        onClose={() => setCatalogOpen(false)} 
      />
    </div>
  );
};

export default DrawerContent;