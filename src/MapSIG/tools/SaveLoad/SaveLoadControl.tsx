import React from "react";
import { useMapStore } from "../../contexts/MapFeaturesContext";
import { Box, IconButton, Tooltip } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import UploadIcon from "@mui/icons-material/Upload";
import { SaveData } from "../../../ts/interfaces/mapSig.interfaces";

const SaveLoadControl: React.FC = () => {
  const { state, addMap, setCurrentMap } = useMapStore();

  const saveToFile = () => {
    const allData: SaveData = {
      maps: {},
      currentMap: state.currentMap,
    };

    Object.keys(state.maps).forEach((key) => {
      const { undoStack, redoStack, ...mapData } = state.maps[key];
      allData.maps[key] = mapData;
    });

    const blob = new Blob([JSON.stringify(allData)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "maps_data.ebgeo";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          const data = JSON.parse(result) as SaveData;

          // Update the store with loaded data
          Object.keys(data.maps).forEach((key) => {
            addMap(key, {
              ...data.maps[key],
              undoStack: [],
              redoStack: [],
            });
          });

          setCurrentMap(data.currentMap);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 90,
        left: 10,
        zIndex: 1000,
        backgroundColor: "white",
        borderRadius: "4px",
        boxShadow: "0 0 0 2px rgba(0,0,0,.1)",
      }}
    >
      <Tooltip title="Save">
        <IconButton onClick={saveToFile}>
          <SaveIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Load">
        <IconButton component="label">
          <UploadIcon />
          <input type="file" hidden accept=".ebgeo" onChange={loadFromFile} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default SaveLoadControl;
