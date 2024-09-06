import { useEffect, memo } from "react";
import styled from "styled-components";
import baseMapStyles from "./baseMapStyles";
import { ResetNorth, VectorTileInfoControl, FeatureSearchControl } from "./tools";
import { useMain } from "../contexts/MainContext";
import RightSideToolBar from "./RightSideToolBar";
import { PanelProvider } from '../contexts/PanelContext';

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  cursor: default;
`;

declare global {
  interface Window {
    maplibregl?: any;
  }
}

function MapSig() {
  const { setMap, setMapLibregl } = useMain();

  const maplibregl = window?.maplibregl as any;

  useEffect(() => {
    if (!maplibregl) return;

    const map = new maplibregl.Map({
      container: "map-sig",
      style: baseMapStyles,
      attributionControl: false,
      minZoom: 11,
      maxZoom: 17.9,
      maxPitch: 75,
    });

    const bounds = [
      [-45.82515, -22.6995],
      [-43.92333, -21.30216],
    ];

    map.setMaxBounds(bounds);

    setMap(map);
    setMapLibregl(maplibregl)

    return () => {
      setMap(null);
      map.remove();
    };
  }, [maplibregl]);

  return (
    <PanelProvider>
      <FeatureSearchControl />
      <MapContainer id="map-sig">
          <RightSideToolBar
            tools={[
              (pos) => <ResetNorth key={"ResetNorth"} pos={pos} />,
              (pos) => <VectorTileInfoControl key="VectorTileInfo" pos={pos} />,
            ]}
          />
      </MapContainer>
    </PanelProvider>
  );
}

export default memo(MapSig);
