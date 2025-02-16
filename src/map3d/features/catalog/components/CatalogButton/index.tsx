import { type FC } from 'react';
import { useMap3DStore } from '@/map3d/store';
import { useCatalogStore } from '../../store';
import { Tool } from '@/map3d/components/Tool';
import { BlinkWrapper } from './styles';

interface Model3DCatalogButtonProps {
  disabled?: boolean;
}

export const Model3DCatalogButton: FC<Model3DCatalogButtonProps> = ({ 
  disabled 
}) => {
  const models = useMap3DStore(state => state.models);
  const { openPanel, isPanelOpen } = useCatalogStore();

  return (
    <BlinkWrapper $isBlinking={models.length === 0}>
      <Tool
        image="/images/catalog.svg"
        active={true}
        inUse={isPanelOpen}
        disabled={disabled}
        tooltip="Catálogo de modelos 3D"
        onClick={openPanel}
      />
    </BlinkWrapper>
  );
};