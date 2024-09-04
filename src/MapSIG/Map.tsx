import { useEffect, memo } from "react";
import styled from "styled-components";
import baseMapStyles from "./baseMapStyles";
import { ResetNorth } from "./tools";
import { useMain } from "../contexts/MainContext";
import RightSideToolBar from "./RightSideToolBar";

const Map = styled("div")({
  position: "relative",
  width: "100%",
  top: 0,
  left: 0,
  height: "100vh",
  cursor: "default",
});

declare global {
  interface Window {
    maplibregl?: any;
  }
}

function MapSig() {
  const { setMapLibre } = useMain();

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

    setMapLibre(map);

    return () => {
      setMapLibre(null);
      map.remove();
    };
  }, [maplibregl]);

  return (
    <Map id="map-sig">
      <RightSideToolBar
        tools={[
          (pos) => <ResetNorth key={"ResetNorth"} pos={pos} />,
          (pos) => <ResetNorth key={"ResetNorthTest"} pos={pos} />, //exemplo nova tool
        ]}
      />
    </Map>
  );
}

export default memo(MapSig);
