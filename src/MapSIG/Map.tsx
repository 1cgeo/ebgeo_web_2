import { useEffect, memo } from "react";
import styled from "styled-components";
import baseMapStyles from "./baseMapStyles";
import { ResetNorth, VectorTileInfoControl, FeatureSearchControl, TextControl } from "./tools";
import { useMain } from "../contexts/MainContext";
import RightSideToolBar from "./RightSideToolBar";
import { PanelProvider } from '../contexts/PanelContext';
import { MapProvider, getCurrentMapFeatures, useMapStore } from '../contexts/MapFeaturesContext';
import SaveLoadControl from './SaveLoadControl';

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

  useEffect(() => {
    if (!map || !state) return;

    const handleStyleData = () => {
      const features = getCurrentMapFeatures(state);

      if (!map.getSource('texts')) {
        map.addSource('texts', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: features.texts
          }
        });
      }

      if (!map.getLayer('text-layer')) {
        map.addLayer({
          id: 'text-layer',
          type: 'symbol',
          source: 'texts',
          layout: {
            'text-field': ['get', 'text'],
            'text-size': ['get', 'size'],
            'text-justify': ['get', 'justify'],
            'text-anchor': 'center',
            'text-rotate': ['get', 'rotation'],
            'text-ignore-placement': true,
            "text-font": ["Noto Sans Regular"]
          },
          paint: {
            'text-color': ['get', 'color'],
            'text-halo-color': ['get', 'backgroundColor'],
            'text-halo-width': 2
          }
        });
      }

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
      <SaveLoadControl />
      <FeatureSearchControl />
      <MapContainer id="map-sig">
        <RightSideToolBar
          tools={[
            (pos) => <ResetNorth key={"ResetNorth"} pos={pos} />,
            (pos) => <VectorTileInfoControl key="VectorTileInfo" pos={pos} />,
            (pos) => <TextControl key="TextControl" pos={pos} />,
          ]}
        />
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