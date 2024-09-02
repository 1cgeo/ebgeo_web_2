import { useEffect, useState, memo } from "react";
import styled from "styled-components";
import baseMapStyles from "./baseMapStyles";

const Map = styled("div")({
  position: "relative",
  width: "100%",
  top: 0,
  left: 0,
  height: "100vh",
  cursor: "default",
});

function MapSig() {
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    if (!window?.maplibregl) return;

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

    return () => {
      map.remove();
    };
  }, [window?.maplibregl]);

  return <Map id="map-sig" />;
}

export default memo(MapSig);
