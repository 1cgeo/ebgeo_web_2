// Path: map3d\features\label\LabelControl\index.tsx
import { FC, useEffect, useState } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { Tool } from '../../../components/Tool';
import { useMap3DToolState } from '../../../store';
import { TextAttributesPanel } from '../LabelPanel';
import { useLabel } from '../useLabel';

export const LabelControl: FC = () => {
  const { isActive, isEnabled } = useMap3DToolState('label');
  const [currentProperties, setCurrentProperties] = useState<any>({});
  const [currentLabel, setCurrentLabel] = useState<any>(null);
  const { setup } = useLabel();
  const [labelHandler, setLabelHandler] = useState<any>(null);
  const { cesium, cesiumMap } = useMapsStore();

  const defaultProperties = {
    text: 'TEXTO',
    size: 38,
    align: 'center',
    fillColor: '#FFFFFF',
    backgroundColor: '#000000A3',
  };

  // Inicializa o manipulador de label usando o setup
  useEffect(() => {
    // Obtenha as instâncias Cesium do store global
    if (cesium && cesiumMap && setup) {
      const handler = setup(cesium, cesiumMap);
      setLabelHandler(handler);

      return () => {
        // Limpeza
        if (handler && handler.clean) {
          handler.clean();
        }
      };
    }
  }, [cesium, cesiumMap, setup]);

  // Configura os event handlers quando o manipulador estiver disponível
  useEffect(() => {
    if (!labelHandler) return;

    const onCreated = (labelEntity: any) => {
      labelHandler.setLabelProperties(labelEntity, defaultProperties);
    };

    const onSelect = (labelEntity: any) => {
      setCurrentProperties({
        id: labelEntity._id,
        ...labelHandler.getLabelProperties(labelEntity),
      });
      setCurrentLabel(labelEntity);
    };

    labelHandler.onCreated(onCreated);
    labelHandler.onSelect(onSelect);

    return () => {
      labelHandler.offCreated();
      labelHandler.offSelect();
    };
  }, [labelHandler, defaultProperties]);

  // Ativa/desativa o manipulador de label com base no estado ativo
  useEffect(() => {
    if (labelHandler) {
      labelHandler.setActive(isActive);
    }
  }, [isActive, labelHandler]);

  return (
    <>
      <Tool
        id="label"
        image="/images/icon_text_black.svg"
        active={isActive}
        disabled={!isEnabled}
        tooltip="Adicionar Texto"
      />

      {currentLabel && labelHandler && (
        <TextAttributesPanel
          properties={currentProperties}
          onUpdate={properties => {
            labelHandler.setLabelProperties(currentLabel, properties);
          }}
          onDelete={() => {
            labelHandler.remove(currentLabel);
            setCurrentLabel(null);
          }}
          onClose={() => {
            labelHandler.deselectAll();
            setCurrentLabel(null);
          }}
        />
      )}
    </>
  );
};
