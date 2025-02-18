// Path: mapSig\features\textTool\useTextLayer.ts
import { useEffect } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import {
  TEXT_LAYER_ID,
  TEXT_SOURCE_ID,
  textLayerStyle,
} from './textLayerConfig';
import { type TextAttributes } from './types';

function convertToGeoJSON(texts: TextAttributes[]) {
  return {
    type: 'FeatureCollection',
    features: texts.map(text => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [text.coordinates.lng, text.coordinates.lat],
      },
      properties: {
        id: text.id,
        text: text.text,
        size: text.size,
        color: text.color,
        backgroundColor: text.backgroundColor,
        justify: text.justify,
        rotation: text.rotation,
      },
    })),
  };
}

export function useTextLayer() {
  const { map } = useMapsStore();

  const initializeLayer = () => {
    if (!map) return;

    // Adiciona source se não existir
    if (!map.getSource(TEXT_SOURCE_ID)) {
      map.addSource(TEXT_SOURCE_ID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });
    }

    // Adiciona layer se não existir
    if (!map.getLayer(TEXT_LAYER_ID)) {
      map.addLayer({
        id: TEXT_LAYER_ID,
        source: TEXT_SOURCE_ID,
        ...textLayerStyle,
      });

      // Adiciona eventos de mouse para hover
      map.on('mouseenter', TEXT_LAYER_ID, () => {
        if (
          !map.getCanvas().style.cursor ||
          map.getCanvas().style.cursor === ''
        ) {
          map.getCanvas().style.cursor = 'pointer';
        }
      });

      map.on('mouseleave', TEXT_LAYER_ID, () => {
        if (map.getCanvas().style.cursor === 'pointer') {
          map.getCanvas().style.cursor = '';
        }
      });
    }
  };

  const updateLayer = (texts: TextAttributes[]) => {
    if (!map) return;

    const source = map.getSource(TEXT_SOURCE_ID);
    if (!source) return;

    source.setData(convertToGeoJSON(texts));
  };

  const removeLayer = () => {
    if (!map) return;

    if (map.getLayer(TEXT_LAYER_ID)) {
      map.off('mouseenter', TEXT_LAYER_ID);
      map.off('mouseleave', TEXT_LAYER_ID);
      map.removeLayer(TEXT_LAYER_ID);
    }
    if (map.getSource(TEXT_SOURCE_ID)) {
      map.removeSource(TEXT_SOURCE_ID);
    }
  };

  // Inicializa a camada quando o mapa estiver pronto
  useEffect(() => {
    if (!map) return;

    const handleStyleData = () => {
      initializeLayer();
    };

    map.on('styledata', handleStyleData);
    map.on('load', handleStyleData);

    if (map.loaded()) {
      initializeLayer();
    }

    return () => {
      map.off('styledata', handleStyleData);
      map.off('load', handleStyleData);
      removeLayer();
    };
  }, [map]);

  return {
    updateLayer,
    removeLayer,
  };
}
