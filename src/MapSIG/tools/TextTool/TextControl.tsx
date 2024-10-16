import React, { useCallback, useState, useEffect } from "react";
import ToolControl from "../ToolControl";
import TextAttributesPanel from "./TextAttributesPanel";
import { useMain } from "../../../contexts/MainContext";
import { usePanel } from "../../contexts/PanelContext";
import { useMapStore } from "../../contexts/MapFeaturesContext";
import { useSelection } from "../../contexts/SelectionContext";
import { TextFeature } from "../../../ts/interfaces/mapSig.interfaces";
import { FeatureType } from "../../../ts/types/mapSig.types";

const DEFAULT_PROPERTIES: TextFeature["properties"] = {
  text: "Novo texto",
  size: 16,
  color: "#000000",
  backgroundColor: "#ffffff",
  rotation: 0,
  justify: "center" as const,
  source: "texts" as FeatureType,
};

const TextControl: React.FC = () => {
  const { map } = useMain();
  const { openPanel, setOpenPanel } = usePanel();
  const { addFeature, updateFeature, removeFeature } = useMapStore();
  const { selectFeature, clearSelection } = useSelection();
  const [isAddingText, setIsAddingText] = useState(false);

  const handleActivate = useCallback(() => {
    console.log("Text tool activated");
    setIsAddingText(true);
    clearSelection();
  }, [clearSelection]);

  const handleDeactivate = useCallback(() => {
    console.log("Text tool deactivated");
    setIsAddingText(false);
    setOpenPanel(null);
  }, [setOpenPanel]);

  const handleMapClick = useCallback(
    (e: MouseEvent) => {
      if (!isAddingText || !map) return;

      const { lng, lat } = map.unproject([e.clientX, e.clientY]);

      const newFeature: TextFeature = {
        id: Date.now().toString(),
        type: "Feature",
        properties: { ...DEFAULT_PROPERTIES },
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
      };

      addFeature("texts", newFeature);
      selectFeature(newFeature, false);
      setOpenPanel("textAttributes");
      setIsAddingText(false);
    },
    [isAddingText, map, addFeature, selectFeature, setOpenPanel]
  );

  useEffect(() => {
    if (!map) return;

    if (isAddingText) {
      map.getCanvas().addEventListener("click", handleMapClick);
    } else {
      map.getCanvas().removeEventListener("click", handleMapClick);
    }

    return () => {
      map.getCanvas().removeEventListener("click", handleMapClick);
    };
  }, [map, isAddingText, handleMapClick]);

  const updateTextFeatures = useCallback(
    (updatedFeatures: TextFeature[]) => {
      updatedFeatures.forEach((feature) => {
        updateFeature("texts", feature, feature);
      });
    },
    [updateFeature]
  );

  const deleteTextFeatures = useCallback(
    (features: TextFeature[]) => {
      features.forEach((feature) => {
        removeFeature("texts", feature);
      });
      clearSelection();
      setOpenPanel(null);
    },
    [removeFeature, clearSelection, setOpenPanel]
  );

  return (
    <ToolControl
      name="text"
      icon="/images/icon_text_black.svg"
      tooltip="Adicionar texto ao mapa"
      onActivate={handleActivate}
      onDeactivate={handleDeactivate}
    >
      {openPanel === "textAttributes" && (
        <TextAttributesPanel
          updateFeatures={updateTextFeatures}
          deleteFeatures={deleteTextFeatures}
          onClose={() => setOpenPanel(null)}
        />
      )}
    </ToolControl>
  );
};

export default TextControl;
