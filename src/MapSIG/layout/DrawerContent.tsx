import { FC } from "react";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import {
  ResetNorth,
  VectorTileInfoControl,
  FeatureSearchControl,
  TextControl,
} from "../tools";
import {
  DrawerContentProps,
  DrawerItemProps,
} from "../../ts/interfaces/mapSig.interfaces";

const DrawerContent: FC<DrawerContentProps> = ({ onSelect }) => {
  return (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {[
          {
            name: "Pesquisar Local",
            component: <FeatureSearchControl />,
          },
          {
            name: "Resetar Orientação",
            component: <ResetNorth />,
          },
          {
            name: "Obter Informação",
            component: <VectorTileInfoControl />,
          },
          {
            name: "Adicionar Texto",
            component: <TextControl />,
          },
        ].map((item: DrawerItemProps) => (
          <ListItem key={item.name} disablePadding>
            {
              <Button
                component="label"
                role={undefined}
                tabIndex={-1}
                startIcon={item.component}
                sx={{
                  color: "black",
                }}
                onClick={onSelect}
              >
                {item.name}
              </Button>
            }
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default DrawerContent;
