import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Avatar,
  Tooltip,
} from "@mui/material";
import { ZoomIn, Close, Visibility, VisibilityOff } from "@mui/icons-material";
import { useMapTools } from "../contexts/Map3DTools";

type VisibilityButtonProps = {
  isVisible: boolean;
  onVisibleModel: any;
};
const VisibilityButton: React.FC<VisibilityButtonProps> = ({
  isVisible,
  onVisibleModel,
}) => {
  return (
    <IconButton size="small" onClick={onVisibleModel} sx={{ ml: 0.5 }}>
      {" "}
      {isVisible ? (
        <Visibility fontSize="small" />
      ) : (
        <VisibilityOff fontSize="small" />
      )}
    </IconButton>
  );
};

const Model3DLayerList: React.FC = () => {
  const { models, zoomToModel, removeModel, setVisibleModel, isVisibleModel } =
    useMapTools();

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <Box
      sx={{
        position: "absolute",
        left: 10,
        top: 120,
        width: 250,
        maxHeight: "calc(100vh - 140px)",
        overflowY: "auto",
        backgroundColor: "white",
        borderRadius: 1,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        zIndex: 1000,
      }}
    >
      <List disablePadding>
        {models.map((model) => (
          <ListItem
            key={model.id}
            disableGutters
            sx={{
              py: 0.5,
              px: 1,
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
            }}
          >
            <Avatar
              src={model.thumbnail}
              variant="rounded"
              sx={{ width: 32, height: 32, mr: 1 }}
            />
            <Tooltip title={model.name}>
              <ListItemText
                primary={truncateText(model.name, 20)}
                primaryTypographyProps={{
                  noWrap: true,
                  fontSize: "0.875rem",
                  fontWeight: "medium",
                }}
              />
            </Tooltip>
            <VisibilityButton
              isVisible={isVisibleModel(model.id)}
              onVisibleModel={() =>
                setVisibleModel(model.id, !isVisibleModel(model.id))
              }
            />
            <IconButton
              size="small"
              onClick={() => zoomToModel(model.id)}
              sx={{ ml: 0.5 }}
            >
              <ZoomIn fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => removeModel(model.id)}
              sx={{ ml: 0.5 }}
            >
              <Close fontSize="small" />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Model3DLayerList;
