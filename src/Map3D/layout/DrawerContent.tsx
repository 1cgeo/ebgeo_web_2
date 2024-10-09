import { FC } from "react";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Model3DCatalogButton from "../catalog/Model3DCatalogButton";

interface Props {
  onSelect: () => void;
}

interface Item {
  name: string;
  component: any;
}

const DrawerContent: FC<Props> = ({ onSelect }) => {
  return (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {[
          {
            name: "Catálogo 3D",
            component: <Model3DCatalogButton />,
          },
        ].map((item: Item) => (
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
