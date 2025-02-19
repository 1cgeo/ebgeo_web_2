// Path: map3d\features\viewshed\ViewshedControl\index.tsx
import { FC, useEffect } from 'react';

import { Tool } from '../../../components/Tool';
import { useMap3DToolState } from '../../../store';
import { useViewshedStore } from '../store';
import { ViewshedToolState } from '../types';
import { useViewshed } from '../useViewshed';

export const ViewshedControl: FC = () => {
  const { isActive, isEnabled } = useMap3DToolState('viewshed');
  const { addViewshed, cancelViewshedAnalysis } = useViewshed();
  const toolState = useViewshedStore(state => state.toolState);

  // Sincroniza o estado da ferramenta com o estado do mapa
  useEffect(() => {
    if (isActive && toolState === ViewshedToolState.INACTIVE) {
      addViewshed();
    } else if (!isActive && toolState === ViewshedToolState.ACTIVE) {
      cancelViewshedAnalysis();
    }
  }, [isActive, toolState, addViewshed, cancelViewshedAnalysis]);

  return (
    <Tool
      id="viewshed"
      image="/images/icon-viewshed.svg"
      tooltip="Análise de visibilidade"
      active={isActive}
      disabled={!isEnabled}
    />
  );
};
