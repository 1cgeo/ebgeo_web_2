import { useEffect, useState, FC } from 'react';
import { useMain } from '../../../contexts/MainContext';
import { usePanel } from '../../contexts/PanelContext';
import { useMapStore, addFeature, removeFeature } from '../../contexts/MapFeaturesContext';
import Tool from '../Tool';
import TextAttributesPanel from './TextAttributesPanel';

type Props = {
  pos: { right?: number; top?: number; left?: number; bottom?: number };
};

type GenericMapMouseEvent = {
    lngLat: { lng: number; lat: number };
};

type GenericLngLat = {
    lng: number;
    lat: number;
};

type GenericGeoJSONSource = {
    _data: any;
    setData: (data: any) => void;
};

type GenericFeatureCollection = {
    features: GenericFeature[];
};

type GenericFeature = {
    id: string;
    type: 'Feature';
    properties: Record<string, any>;
    geometry: {
        type: string;
        coordinates: number[];
    };
};

interface TextFeature extends GenericFeature {
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
    const { dispatch } = useMapStore();
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
  
    const addTextFeature = (lngLat: GenericLngLat, text: string) => {
      const feature: TextFeature = {
        type: 'Feature',
        id: Date.now().toString(),
        properties: { ...DEFAULT_PROPERTIES, text },
        geometry: {
          type: 'Point',
          coordinates: [lngLat.lng, lngLat.lat]
        }
      };
  
      addFeature(dispatch, 'texts', feature);
      updateMapSource(feature);
      setSelectedFeatures([feature]);
      setOpenPanel('textAttributes');
    };
  
    const updateMapSource = (feature: TextFeature) => {
      if (!map) return;
      const source = map.getSource('texts') as GenericGeoJSONSource;
      const data = source._data as GenericFeatureCollection;
      data.features.push(feature);
      source.setData(data);
    };
  
    const updateFeatures = (updatedFeatures: TextFeature[]) => {
      if (!map) return;
      const source = map.getSource('texts') as GenericGeoJSONSource;
      const data = source._data as GenericFeatureCollection;
      updatedFeatures.forEach(feature => {
        const index = data.features.findIndex(f => f.id === feature.id);
        if (index !== -1) {
          data.features[index] = feature;
        }
      });
      source.setData(data);
      setSelectedFeatures(updatedFeatures);
    };
  
    const deleteFeatures = (features: TextFeature[]) => {
      if (!map) return;
      const source = map.getSource('texts') as GenericGeoJSONSource;
      const data = source._data as GenericFeatureCollection;
      const idsToDelete = new Set(features.map(f => f.id));
      data.features = data.features.filter(f => !idsToDelete.has(f.id));
      source.setData(data);
      features.forEach(f => removeFeature(dispatch, 'texts', f));
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
            updateFeatures={updateFeatures}
            deleteFeatures={deleteFeatures}
            onClose={() => setOpenPanel(null)}
          />
        )}
      </>
    );
  };
  
  export default TextControl;