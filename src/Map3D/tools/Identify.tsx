import { FC, useCallback, useState, useEffect } from "react";
import Tool from "./Tool";
import { useMain } from "../../contexts/MainContext";
import { useMapTools } from "../contexts/Map3DTools";
import styled from "styled-components";
import config from '../../config';

const FeatureInfoPanel = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  max-width: 300px;
  z-index: 1000;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  cursor: pointer;
`;

interface FeatureInfo {
  nome: string;
  municipio: string;
  estado: string;
  tipo: string;
  altitude_base: number;
  altitude_topo: number;
}

const Identify: FC = () => {
  const { cesium, cesiumMap } = useMain();
  const { setActiveTool, activeTool, areToolsEnabled } = useMapTools();
  const [featureInfo, setFeatureInfo] = useState<FeatureInfo | null>(null);

  const handleTool = useCallback(() => {
    if (areToolsEnabled) {
      setActiveTool(activeTool === "identify" ? null : "identify");
    }
  }, [activeTool, setActiveTool, areToolsEnabled]);

  const fetchFeatureInfo = useCallback(async (lon: number, lat: number, z: number) => {
    try {
      const response = await fetch(`${config.endpoints.featureInfo}?lat=${lat}&lon=${lon}&z=${z}`);
      if (!response.ok) {
        throw new Error('Error in server response');
      }
      const data = await response.json();
      setFeatureInfo(data);
    } catch (error) {
      console.error('Error fetching feature information:', error);
      setFeatureInfo(null);
    }
  }, []);

  const handleMapClick = useCallback((event: any) => {
    if (activeTool !== "identify" || !cesium || !cesiumMap) return;

    const canvas = cesiumMap.scene.canvas;
    const rect = canvas.getBoundingClientRect();
    const position = new cesium.Cartesian2(
      event.clientX - rect.left,
      event.clientY - rect.top
    );

    const pickedFeature = cesiumMap.scene.pick(position);
    if (cesium.defined(pickedFeature)) {
      const cartesian = cesiumMap.scene.pickPosition(position);
      if (cesium.defined(cartesian)) {
        const cartographic = cesium.Cartographic.fromCartesian(cartesian);
        const longitude = cesium.Math.toDegrees(cartographic.longitude);
        const latitude = cesium.Math.toDegrees(cartographic.latitude);
        const height = cartographic.height;

        fetchFeatureInfo(longitude, latitude, height);
      }
    }
  }, [activeTool, cesium, cesiumMap, fetchFeatureInfo]);

  useEffect(() => {
    if (cesiumMap && activeTool === "identify") {
      cesiumMap.canvas.addEventListener('click', handleMapClick);
    }
    return () => {
      if (cesiumMap) {
        cesiumMap.canvas.removeEventListener('click', handleMapClick);
      }
    };
  }, [cesiumMap, activeTool, handleMapClick]);

  return (
    <>
      <Tool
        image="/images/information_circle.svg"
        active={true}
        inUse={activeTool === "identify"}
        disabled={!areToolsEnabled}
        tooltip="Identificar elementos"
        onClick={handleTool}
      />
      {featureInfo && (
        <FeatureInfoPanel>
          <CloseButton onClick={() => setFeatureInfo(null)}>✕</CloseButton>
          <h3>Feature Information</h3>
          <p><strong>Nome:</strong> {featureInfo.nome}</p>
          <p><strong>Município:</strong> {featureInfo.municipio}</p>
          <p><strong>Estado:</strong> {featureInfo.estado}</p>
          <p><strong>Tipo:</strong> {featureInfo.tipo}</p>
          <p><strong>Altitude Base:</strong> {featureInfo.altitude_base} m</p>
          <p><strong>Altitude Topo:</strong> {featureInfo.altitude_topo} m</p>
        </FeatureInfoPanel>
      )}
    </>
  );
};

export default Identify;