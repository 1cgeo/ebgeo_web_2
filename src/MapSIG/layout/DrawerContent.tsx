import { FC } from "react";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";

interface Props {
  onSelect: () => void;
}

interface Item {
  name: string
  component: any
}

const DrawerContent: FC<Props> = ({ onSelect }) => {
  return (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {[  
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
