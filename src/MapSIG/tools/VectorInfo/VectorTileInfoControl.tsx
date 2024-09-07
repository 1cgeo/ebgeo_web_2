import { useEffect, useState, useCallback, FC } from "react";
import Tool from "../Tool";
import { useMain } from "../../../contexts/MainContext";
import { usePanel } from '../../contexts/PanelContext';
import VectorTileInfoPanel from "./VectorTileInfoPanel";

type Props = {
  pos: { right?: number; top?: number; left?: number; bottom?: number };
};

type GenericMapMouseEvent = {
    point: { x: number; y: number };
  };
  
type GenericMapGeoJSONFeature = {
    source?: string;
    geometry: {
      type: string;
    };
    properties: Record<string, any>;
};
  
const VectorTileInfoControl: FC<Props> = ({ pos }) => {
  const { map: map } = useMain();
  const { openPanel, setOpenPanel } = usePanel();
  const [active, setActive] = useState<boolean>(false);
  const [selectedFeature, setSelectedFeature] = useState<GenericMapGeoJSONFeature | null>(null);

  useEffect(() => {
    if (!map) return;
    
    const handleMapClick = (e: GenericMapMouseEvent) => {
      if (!active) return;

      const features = map.queryRenderedFeatures(e.point) as GenericMapGeoJSONFeature[];
      if (features.length > 0) {
        const preferenceOrder = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'];
    
        features.sort((a: GenericMapGeoJSONFeature, b: GenericMapGeoJSONFeature) => {
          const aPriority = a.source?.startsWith('cobter_') ? 6 : preferenceOrder.indexOf(a.geometry.type);
          const bPriority = b.source?.startsWith('cobter_') ? 6 : preferenceOrder.indexOf(b.geometry.type);
          
          return (aPriority ?? -1) - (bPriority ?? -1);
        });

        setSelectedFeature(features[0]);
      }
      setOpenPanel('vectorTileInfo');
    };

    if (active) {
      map.on('click', handleMapClick);
      map.getCanvas().style.cursor = 'help';
    } else {
      map.off('click', handleMapClick);
      map.getCanvas().style.cursor = '';
      setOpenPanel(null);
      setSelectedFeature(null);
    }

    return () => {
      map.off('click', handleMapClick);
      map.getCanvas().style.cursor = '';
    };
  }, [map, active, setOpenPanel]);

  const toggleActive = useCallback(() => {
    setActive((prev) => !prev);
    if (!active) {
      setOpenPanel(null);
      setSelectedFeature(null);
    }
  }, [active, setOpenPanel]);

  const handleClosePanel = () => {
    setOpenPanel(null);
    setSelectedFeature(null);
    setActive(false);
  };

  return (
    <>
      <Tool
        image="/images/icon_info_black.svg"
        active={true}
        inUse={active}
        pos={pos}
        onClick={toggleActive}
      />
      {openPanel === 'vectorTileInfo' && (
        <VectorTileInfoPanel 
          feature={selectedFeature} 
          onClose={handleClosePanel}
        />
      )}
    </>
  );
};

export default VectorTileInfoControl;