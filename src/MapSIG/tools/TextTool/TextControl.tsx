import { useEffect, useState, FC } from 'react';
import { useMain } from '../../../contexts/MainContext';
import { usePanel } from '../../contexts/PanelContext';
import { useMapStore } from '../../contexts/MapFeaturesContext';
import Tool from '../Tool';
import TextAttributesPanel from './TextAttributesPanel';

type Props = {
  pos: { right?: number; top?: number; left?: number; bottom?: number };
};

type GenericMapMouseEvent = {
    lngLat: { lng: number; lat: number };
};

interface TextFeature {
  id: string;
  type: 'Feature';
  properties: {
      text: string;
      size: number;
      color: string;
      backgroundColor: string;
      rotation: number;
      justify: 'left' | 'center' | 'right';
      source: string;
  };
  geometry: {
      type: 'Point';
      coordinates: [number, number];
  };
}

const DEFAULT_PROPERTIES = {
    text: '',
    size: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
    rotation: 0,
    justify: 'center' as const,
    source: 'text'
};

const TextControl: FC<Props> = ({ pos }) => {
    const { map } = useMain();
    const { openPanel, setOpenPanel } = usePanel();
    const { addFeature, updateFeature, removeFeature } = useMapStore();
    const [active, setActive] = useState(false);
    const [selectedFeatures, setSelectedFeatures] = useState<TextFeature[]>([]);
  
    useEffect(() => {
      if (!map) return;
  
      const handleMapClick = (e: GenericMapMouseEvent) => {
        if (active) {
          addTextFeature(e.lngLat, 'Texto');
          setActive(false);
        }
      };
  
      map.on('click', handleMapClick as any);
  
      return () => {
        map.off('click', handleMapClick as any);
      };
    }, [map, active]);
  
    const addTextFeature = (lngLat: { lng: number; lat: number }, text: string) => {
      const feature: TextFeature = {
        type: 'Feature',
        id: Date.now().toString(),
        properties: { ...DEFAULT_PROPERTIES, text },
        geometry: {
          type: 'Point',
          coordinates: [lngLat.lng, lngLat.lat]
        }
      };
  
      addFeature('texts', feature);
      setSelectedFeatures([feature]);
      setOpenPanel('textAttributes');
    };
  
    const updateTextFeatures = (updatedFeatures: TextFeature[]) => {
      updatedFeatures.forEach(feature => {
        updateFeature('texts', feature, feature);
      });
      setSelectedFeatures(updatedFeatures);
    };
  
    const deleteTextFeatures = (features: TextFeature[]) => {
      features.forEach(feature => {
        removeFeature('texts', feature);
      });
      setSelectedFeatures([]);
      setOpenPanel(null);
    };
  
    const handleToolClick = () => {
      setActive(!active);
      if (!active) {
        setOpenPanel(null);
        setSelectedFeatures([]);
      }
    };
  
    return (
      <>
        <Tool
          image="/images/icon_text_black.svg"
          active={true}
          inUse={active}
          pos={pos}
          onClick={handleToolClick}
        />
        {openPanel === 'textAttributes' && (
          <TextAttributesPanel
            features={selectedFeatures}
            updateFeatures={updateTextFeatures}
            deleteFeatures={deleteTextFeatures}
            onClose={() => setOpenPanel(null)}
          />
        )}
      </>
    );
  };
  
  export default TextControl;