import { useEffect, memo, useCallback } from "react";
import styled from "styled-components";
import topoBaseMapStyles from "./tools/BaseMapToggle/topoBaseMapStyles";
import { ResetNorth, VectorTileInfoControl, FeatureSearchControl, TextControl, SaveLoadControl } from "./tools";
import { useMain } from "../contexts/MainContext";
import RightSideToolBar from "./RightSideToolBar";
import PanelProvider from './contexts/PanelContext';
import { MapProvider, useMapStore, getLayerType, getLayerPaint, getLayerLayout } from './contexts/MapFeaturesContext';
import BaseMapToggleControl from "./tools/BaseMapToggle/BaseMapToggleControl";

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

function MapContent() {
  const { setMap, setMapLibregl, map } = useMain();
  const { state } = useMapStore();

  const maplibregl = window?.maplibregl as any;

  const initializeMap = useCallback(() => {
    if (!maplibregl) return;

    const newMap = new maplibregl.Map({
      container: "map-sig",
      style: topoBaseMapStyles,
      attributionControl: false,
      minZoom: 11,
      maxZoom: 17.9,
      maxPitch: 75,
    });

    const bounds = [
      [-45.82515, -22.6995],
      [-43.92333, -21.30216],
    ];

    newMap.setMaxBounds(bounds);

    setMap(newMap);
    setMapLibregl(maplibregl);

    return newMap;
  }, [maplibregl, setMap, setMapLibregl]);

  useEffect(() => {
    const map = initializeMap();
    return () => {
      if (map) {
        setMap(null);
        map.remove();
      }
    };
  }, [initializeMap, setMap]);

  useEffect(() => {
    if (!map || !state) return;

    const handleStyleData = () => {
      const features = state.maps[state.currentMap].features;

      Object.entries(features).forEach(([featureType, featureList]) => {
        const sourceId = `${featureType}-source`;
        const layerId = `${featureType}-layer`;

        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: featureList
            }
          });
        } else {
          const source = map.getSource(sourceId);
          source.setData({
            type: 'FeatureCollection',
            features: featureList
          });
        }

        if (!map.getLayer(layerId)) {
          map.addLayer({
            id: layerId,
            type: getLayerType(featureType as any),
            source: sourceId,
            paint: getLayerPaint(featureType as any),
            layout: getLayerLayout(featureType as any)
          });        }
      });
    };

    map.on('styledata', handleStyleData);
    map.on('load', handleStyleData);

    return () => {
      map.off('styledata', handleStyleData);
      map.off('load', handleStyleData);
    };
  }, [map, state]);

  return (
    <>
      <MapContainer id="map-sig">
        <SaveLoadControl />
        <FeatureSearchControl />
        <RightSideToolBar
          tools={[
            (pos) => <ResetNorth key={"ResetNorth"} pos={pos} />,
            (pos) => <VectorTileInfoControl key="VectorTileInfo" pos={pos} />,
            (pos) => <TextControl key="TextControl" pos={pos} />,
          ]}
        />
        <BaseMapToggleControl />
      </MapContainer>
    </>
  );
}

function MapSig() {
  return (
    <MapProvider>
      <PanelProvider>
        <MapContent />
      </PanelProvider>
    </MapProvider>
  );
}

export default memo(MapSig);