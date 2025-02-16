// Path: mapSig\features\featureSearch\FeatureSearchControl\index.tsx
import SearchIcon from '@mui/icons-material/Search';
import { Tooltip } from '@mui/material';

import { type FC } from 'react';

import { FeatureSearchPanel } from '../FeatureSearchPanel';
import { useFeatureSearchStore } from '../store';
import { StyledIconButton } from './styles';

export const FeatureSearchControl: FC = () => {
  const { isPanelOpen, openPanel, closePanel } = useFeatureSearchStore();

  return (
    <>
      <Tooltip title="Buscar feições" placement="left">
        <StyledIconButton onClick={openPanel} $active={isPanelOpen}>
          <SearchIcon />
        </StyledIconButton>
      </Tooltip>

      <FeatureSearchPanel open={isPanelOpen} onClose={closePanel} />
    </>
  );
};
