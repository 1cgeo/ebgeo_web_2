import { FC, useCallback, useEffect, useState } from "react";
import Tool from "../Tool";
import { useMapTools } from "../../contexts/Map3DTools";
import TextAttributesPanel from "./TextAttributesPanel";

const Area: FC = () => {
  const { setActiveTool, activeTool, areToolsEnabled, cesiumLabel } =
    useMapTools();

  const defaultProperties = {
    text: "TEXTO",
    size: 38,
    align: "center",
    fillColor: "#FFFFFF",
    backgroundColor: "#000000A3",
  };

  const [currentProperties, setCurrentProperties] = useState<any>({});

  const [currentLabel, setCurrentLabel] = useState<any>(null);

  const handleTool = useCallback(() => {
    setActiveTool("label");
  }, []);

  useEffect(() => {
    if (!cesiumLabel) return;
    cesiumLabel.onCreated((labelEntity: any) => {
      cesiumLabel.setLabelProperties(labelEntity, defaultProperties);
    });

    cesiumLabel.onSelect((labelEntity: any) => {
      setCurrentProperties({
        id: labelEntity._id,
        ...cesiumLabel.getLabelProperties(labelEntity),
      });
      setCurrentLabel(labelEntity);
    });
    return () => {
      cesiumLabel.offCreated();
      cesiumLabel.offSelect();
    };
  }, [cesiumLabel]);

  return (
    <>
      <Tool
        image="/images/icon_text_black.svg"
        active={true}
        inUse={activeTool === "label"}
        disabled={!areToolsEnabled}
        tooltip="Adicionar Texto"
        onClick={handleTool}
      />
      {currentLabel && (
        <TextAttributesPanel
          properties={currentProperties}
          onUpdate={(properties) => {
            cesiumLabel.setLabelProperties(currentLabel, properties);
          }}
          onDelete={() => {
            cesiumLabel.remove(currentLabel);
            setCurrentLabel(null);
          }}
          onClose={() => {
            cesiumLabel.deselectAll()
            setCurrentLabel(null);
          }}
        />
      )}
    </>
  );
};

export default Area;
